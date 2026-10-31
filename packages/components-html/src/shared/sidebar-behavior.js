export function selectSidebarItem(target) {
  if (!target?.matches?.('button.tui-sidebar-item[data-component="sidebar"]') || target.disabled) return false;
  const scope = target.closest('.tui-sidebar-groups') ?? target.closest('.tui-sidebar');
  for (const item of scope?.querySelectorAll('.tui-sidebar-item') ?? [target]) {
    const selected = item === target;
    if (item.disabled) continue;
    item.dataset.state = selected ? 'selected' : 'default';
    if (item.dataset.variant !== 'collapsed') item.dataset.variant = selected ? 'selected' : 'default';
    if (selected) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  }
  return true;
}
