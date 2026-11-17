export function bindAttachmentActions(root, { onAction = () => {} } = {}) {
  let openMenu = null;

  function closeMenu(restoreFocus = false) {
    if (!openMenu) return;
    const { trigger, menu } = openMenu;
    openMenu = null;
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus();
  }

  function menuItems(menu) {
    return [...menu.querySelectorAll('[role="menuitem"]:not(:disabled)')];
  }

  function showMenu(trigger, last = false) {
    const menu = trigger.nextElementSibling;
    if (!menu?.matches('.tui-attachment__menu')) return;
    closeMenu();
    openMenu = { trigger, menu };
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    const focusTarget = menuItems(menu).at(last ? -1 : 0) ?? menu;
    focusTarget.focus();
  }

  function onClick(event) {
    const button = event.target.closest?.(".tui-attachment__actions > button, .tui-attachment__menu button");
    if (!button || button.disabled) return;
    if (button.matches(".tui-attachment__menu-trigger")) {
      if (openMenu?.trigger === button) closeMenu(true);
      else showMenu(button);
      return;
    }
    if (openMenu?.menu.contains(button)) closeMenu(true);
    if (button.dataset.action) onAction(button.dataset.action, button);
  }

  function onKeydown(event) {
    const target = event.target;
    if (event.key === "Escape" && openMenu?.trigger.parentElement.contains(target)) {
      event.preventDefault();
      event.stopPropagation();
      closeMenu(true);
    } else if (target.matches?.(".tui-attachment__menu-trigger:not(:disabled)") && ["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      showMenu(target, event.key === "ArrowUp");
    } else if (openMenu?.menu.contains(target) && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      const items = menuItems(openMenu.menu);
      const index = items.indexOf(target);
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1
        : (index + items.length + (event.key === "ArrowDown" ? 1 : -1)) % items.length;
      event.preventDefault();
      items[next]?.focus();
    }
  }

  function closeOnOutsideClick(event) {
    if (openMenu && !openMenu.trigger.parentElement?.contains(event.target)) closeMenu();
  }

  function closeOnFocusOut(event) {
    if (openMenu && event.relatedTarget && !openMenu.trigger.parentElement?.contains(event.relatedTarget)) closeMenu();
  }

  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKeydown);
  root.addEventListener("focusout", closeOnFocusOut);
  root.ownerDocument.addEventListener("click", closeOnOutsideClick);
  return () => {
    closeMenu();
    root.removeEventListener("click", onClick);
    root.removeEventListener("keydown", onKeydown);
    root.removeEventListener("focusout", closeOnFocusOut);
    root.ownerDocument.removeEventListener("click", closeOnOutsideClick);
  };
}
