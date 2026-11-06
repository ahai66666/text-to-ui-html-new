// Local business state only. Network/model inference is supplied explicitly by the application.
export function createModuleState(initial = {}) {
  let state = {status: 'idle', result: null, error: null, ...initial};
  let sequence = 0, controller = null, disposed = false;
  const listeners = new Set();
  const get = () => structuredClone(state);
  const set = patch => {
    if (disposed) return;
    state = {...state, ...(typeof patch === 'function' ? patch(get()) : patch)};
    for (const listener of listeners) listener(get());
  };
  const cancel = () => { sequence++; controller?.abort(); controller = null; set({status: 'idle'}); };
  return {
    get, set, cancel,
    subscribe(listener) { if (disposed) throw Error('Module state is disposed'); listeners.add(listener); listener(get()); return () => listeners.delete(listener); },
    async run(job) {
      if (typeof job !== 'function') throw Error('Provide an explicit business operation');
      if (disposed) throw Error('Module state is disposed');
      controller?.abort(); const current = ++sequence; controller = new AbortController();
      const signal = controller.signal;
      set({status: 'pending', error: null});
      const update = patch => { if (!disposed && current === sequence && !signal.aborted) set(patch); };
      try {
        const result = await job({signal, update, get});
        if (disposed || current !== sequence || signal.aborted) return {status: 'cancelled'};
        set({status: 'success', result}); return {status: 'success', result};
      } catch (error) {
        if (disposed || current !== sequence || signal.aborted) return {status: 'cancelled'};
        const message = error instanceof Error ? error.message : String(error);
        set({status: 'error', error: message}); return {status: 'error', error: message};
      } finally { if (current === sequence) controller = null; }
    },
    dispose() { disposed = true; sequence++; controller?.abort(); controller = null; listeners.clear(); }
  };
}
