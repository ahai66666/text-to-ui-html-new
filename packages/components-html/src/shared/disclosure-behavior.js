// The trigger owns identity and state; the surrounding scope only relates content.
export function toggleDisclosure(trigger) {
  if (!trigger?.matches('button.tui-disclosure__trigger[data-component="accordion"], button.tui-disclosure__trigger[data-component="collapsible"]') || trigger.disabled) return false;
  const content = trigger.closest('.tui-disclosure')?.querySelector(':scope > .tui-disclosure__content');
  if (!content || content.id !== trigger.getAttribute('aria-controls')) return false;
  const open = trigger.getAttribute('aria-expanded') !== 'true';
  trigger.setAttribute('aria-expanded', String(open));
  trigger.dataset.state = open ? 'open' : 'default';
  trigger.dataset.variant = open ? 'open' : 'default';
  content.hidden = !open;
  return true;
}
