import { renderInputTagChip } from "../shared/core-renderInputTagChip.js";

export function bindInputTagEntry(root = document) {
  if (!root?.addEventListener) return () => {};
  const ownerDocument = root.ownerDocument ?? (root.nodeType === 9 ? root : globalThis.document);
  const getEntry = (target) => target?.closest?.("[data-input-tag-entry]");
  const getInput = (entry) => entry?.querySelector(".tui-input-tag-entry__input");
  const getOptions = (entry) => [...(entry?.querySelectorAll('.tui-input-tag-entry__menu [role="option"]') ?? [])].filter((option) => !option.hidden);
  const getSelectedTags = (entry) => [...(entry?.querySelectorAll("[data-tag-value]") ?? [])].map((tag) => tag.dataset.tagValue ?? "");
  const emitTags = (entry) => entry.dispatchEvent(new CustomEvent("inputtagchange", { bubbles: true, detail: { tags: getSelectedTags(entry) } }));

  const clearActive = (entry) => {
    entry.__tuiInputTagActiveIndex = -1;
    entry.querySelectorAll('.tui-input-tag-entry__menu [role="option"]').forEach((option) => option.setAttribute("aria-selected", "false"));
    getInput(entry)?.removeAttribute("aria-activedescendant");
  };
  const refreshOptions = (entry) => {
    const input = getInput(entry);
    const query = String(input?.value ?? "").trim().toLocaleLowerCase();
    const selected = new Set(getSelectedTags(entry).map((tag) => tag.toLocaleLowerCase()));
    let visibleCount = 0;
    entry.querySelectorAll('.tui-input-tag-entry__menu [role="option"]').forEach((option) => {
      const value = option.dataset.optionValue ?? option.textContent.trim();
      const visible = !selected.has(value.toLocaleLowerCase()) && (!query || value.toLocaleLowerCase().includes(query));
      option.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    const empty = entry.querySelector("[data-empty-state]");
    if (empty) empty.hidden = visibleCount > 0;
    clearActive(entry);
    return getOptions(entry);
  };
  const setOpen = (entry, open) => {
    const input = getInput(entry);
    const menu = entry.querySelector(".tui-input-tag-entry__menu");
    if (!input || !menu) return;
    if (open) refreshOptions(entry);
    menu.hidden = !open;
    input.setAttribute("aria-expanded", String(open));
    entry.dataset.menuOpen = String(open);
    if (!open) clearActive(entry);
  };
  const setActive = (entry, index) => {
    const options = getOptions(entry);
    if (options.length === 0) return clearActive(entry);
    const normalizedIndex = (index + options.length) % options.length;
    clearActive(entry);
    entry.__tuiInputTagActiveIndex = normalizedIndex;
    options[normalizedIndex].setAttribute("aria-selected", "true");
    getInput(entry)?.setAttribute("aria-activedescendant", options[normalizedIndex].id);
  };
  const selectOption = (entry, option) => {
    const value = option.dataset.optionValue ?? option.textContent.trim();
    if (!value || getSelectedTags(entry).some((tag) => tag.toLocaleLowerCase() === value.toLocaleLowerCase())) return;
    const tags = entry.querySelector('[data-slot="tags"]');
    if (!tags) return;
    tags.insertAdjacentHTML("beforeend", renderInputTagChip(value));
    const input = getInput(entry);
    if (input) {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    }
    setOpen(entry, false);
    emitTags(entry);
  };

  const onPointerDown = (event) => {
    const option = event.target.closest?.('.tui-input-tag-entry__menu [role="option"]');
    if (option && !option.hidden) {
      // Commit on pointer down so focus never leaves the input before the
      // option can be chosen; keyboard activation remains handled on Enter.
      event.preventDefault();
      const entry = getEntry(option);
      if (entry && root.contains(entry)) selectOption(entry, option);
      return;
    }
    if (event.target.closest?.("[data-remove-tag]")) event.preventDefault();
  };
  const onClick = (event) => {
    const entry = getEntry(event.target);
    if (!entry || !root.contains(entry)) return;
    const option = event.target.closest?.('.tui-input-tag-entry__menu [role="option"]');
    if (option && !option.hidden) {
      event.preventDefault();
      selectOption(entry, option);
      return;
    }
    const removeButton = event.target.closest?.("[data-remove-tag]");
    if (removeButton) {
      event.preventDefault();
      removeButton.closest("[data-tag-value]")?.remove();
      refreshOptions(entry);
      getInput(entry)?.focus();
      emitTags(entry);
    }
  };
  const onInput = (event) => {
    if (!event.target.matches?.(".tui-input-tag-entry__input")) return;
    const entry = getEntry(event.target);
    if (entry?.dataset.menuOpen === "true") refreshOptions(entry);
  };
  const onKeyDown = (event) => {
    const input = event.target;
    if (!input.matches?.(".tui-input-tag-entry__input")) return;
    const entry = getEntry(input);
    if (!entry) return;
    const open = entry.dataset.menuOpen === "true";
    if (event.key === "Enter") {
      event.preventDefault();
      if (!open) {
        setOpen(entry, true);
        return;
      }
      const active = getOptions(entry)[entry.__tuiInputTagActiveIndex ?? -1];
      if (active) selectOption(entry, active);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(entry, true);
        const options = getOptions(entry);
        setActive(entry, event.key === "ArrowDown" ? 0 : options.length - 1);
        return;
      }
      const options = getOptions(entry);
      const currentIndex = entry.__tuiInputTagActiveIndex ?? -1;
      setActive(entry, event.key === "ArrowDown" ? currentIndex + 1 : currentIndex < 0 ? options.length - 1 : currentIndex - 1);
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(entry, false);
    }
  };
  const onFocusOut = (event) => {
    const entry = getEntry(event.target);
    if (entry && root.contains(entry) && !entry.contains(event.relatedTarget)) setOpen(entry, false);
  };
  const onDocumentPointerDown = (event) => {
    for (const entry of root.querySelectorAll("[data-input-tag-entry]")) {
      if (!entry.contains(event.target)) setOpen(entry, false);
    }
  };

  root.addEventListener("pointerdown", onPointerDown);
  // Handle option/removal clicks before the gallery's delegated menu handler
  // can close the shared select menu and make the clicked option hidden.
  root.addEventListener("click", onClick, true);
  root.addEventListener("input", onInput);
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("focusout", onFocusOut);
  ownerDocument?.addEventListener("pointerdown", onDocumentPointerDown);
  return () => {
    root.removeEventListener("pointerdown", onPointerDown);
    root.removeEventListener("click", onClick, true);
    root.removeEventListener("input", onInput);
    root.removeEventListener("keydown", onKeyDown);
    root.removeEventListener("focusout", onFocusOut);
    ownerDocument?.removeEventListener("pointerdown", onDocumentPointerDown);
  };
}
