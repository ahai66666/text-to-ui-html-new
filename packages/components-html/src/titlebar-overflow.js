/**
 * Shared browser behavior for Titlebar main-detail action groups.
 *
 * The renderer emits every business action plus a fixed More trigger. This
 * adapter measures the available titlebar width and moves trailing actions
 * into the hidden menu instead of clipping them or silently hiding labels.
 */
export function bindTitlebarOverflow(root, { onAction = () => {} } = {}) {
  if (!root?.querySelectorAll) return () => {};

  const groups = [...root.querySelectorAll('[data-action-overflow="collapse-to-more"]')];
  if (!groups.length) return () => {};

  const state = groups.map((group) => {
    const trigger = group.querySelector(':scope > [data-overflow-trigger="true"]');
    const menu = group.querySelector(':scope > .tui-titlebar__overflow-menu');
    const items = [...group.querySelectorAll(':scope > [data-overflow-item="true"]')];
    const menuItems = [...(menu?.querySelectorAll('[data-overflow-menu-item="true"]') ?? [])];
    const menuByAction = new Map(menuItems.map((item) => [item.dataset.action, item]));

    const close = () => {
      if (!menu) return;
      menu.hidden = true;
      trigger?.setAttribute("aria-expanded", "false");
    };

    const update = () => {
      if (!trigger || !menu) return;
      // Restore all actions before measuring. `hidden` is deliberately used so
      // the browser measures the same boxes that are actually painted.
      items.forEach((item) => { item.hidden = false; item.removeAttribute("data-overflow-hidden"); });
      menuItems.forEach((item) => { item.hidden = true; });
      close();

      const fits = () => group.scrollWidth <= group.clientWidth + 1;
      if (!fits()) {
        // Preserve the leading action order. The last business action is the
        // first one collapsed, while More remains visible at all widths.
        for (let index = items.length - 1; index >= 0 && !fits(); index -= 1) {
          const item = items[index];
          item.hidden = true;
          item.dataset.overflowHidden = "true";
          const menuItem = menuByAction.get(item.dataset.action);
          if (menuItem) menuItem.hidden = false;
        }
      }

      const hiddenCount = items.filter((item) => item.hidden).length;
      group.dataset.overflowed = hiddenCount ? "true" : "false";
      trigger.toggleAttribute("data-overflow-empty", hiddenCount === 0);
    };

    const onClick = (event) => {
      const target = event.target.closest?.("button");
      if (!target || !group.contains(target)) return;
      if (target === trigger) {
        event.preventDefault();
        event.stopPropagation();
        const open = menu.hidden === true;
        // Only expose actions that were actually collapsed.
        menu.hidden = !open;
        trigger.setAttribute("aria-expanded", String(open));
        if (open) menu.querySelector('[data-overflow-menu-item="true"]:not([hidden])')?.focus();
        return;
      }
      if (target.matches('[data-overflow-menu-item="true"]')) {
        event.preventDefault();
        event.stopPropagation();
        close();
        onAction(target.dataset.action ?? "more", target);
      }
    };

    group.addEventListener("click", onClick);
    update();
    return { group, update, close, onClick };
  });

  const schedule = () => {
    const win = root.ownerDocument?.defaultView;
    if (win?.requestAnimationFrame) win.requestAnimationFrame(() => state.forEach((entry) => entry.update()));
    else state.forEach((entry) => entry.update());
  };
  const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : null;
  state.forEach((entry) => {
    resizeObserver?.observe(entry.group);
    // The available action width is determined by the final titlebar segment
    // after reserving the fixed window-control area. Observe that segment as
    // well, so actions are rebalanced before they can paint over controls.
    const titlebar = entry.group.closest('.tui-titlebar');
    if (titlebar) resizeObserver?.observe(titlebar);
  });
  const win = root.ownerDocument?.defaultView;
  win?.addEventListener("resize", schedule);
  schedule();

  const onOutsideClick = (event) => {
    state.forEach((entry) => {
      if (!entry.group.contains(event.target)) entry.close();
    });
  };
  root.ownerDocument?.addEventListener("click", onOutsideClick);

  return () => {
    state.forEach((entry) => {
      entry.group.removeEventListener("click", entry.onClick);
      entry.close();
    });
    resizeObserver?.disconnect();
    win?.removeEventListener("resize", schedule);
    root.ownerDocument?.removeEventListener("click", onOutsideClick);
  };
}
