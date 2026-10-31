### Reusable Pattern: Secondary Page Hierarchy

`Secondary Page Pattern · 二级页面模式` has two approved forms. It is a Pattern-layer composition and is not part of the component count.

#### Form A: Continue the primary-page layout

- Keep the application window, Global Title Layer boundaries, Primary Navigation Shell, current high-level navigation selection, and pane dimensions stable. Replace only the owning right/Main pane content.
- Use it when a parent page opens a full-page detail, settings branch, member/project detail, or focused subtask that belongs to the same application context.
- The final-pane leading slot changes to `40px Ghost Back Icon Button + Title_S`. The Back button sits immediately to the left of the secondary-page title (for example, `项目设置`), and the group begins at the normal 24px Main Content axis. Use the approved `arrow_left` semantic icon and an accessible label naming the destination.
- The parent route remains selected in Primary Navigation. Do not add the temporary secondary-page title as another Sidebar route and do not flatten page depth into breadcrumbs unless the depth exceeds one level or the product already requires breadcrumbs.
- Keep Main Content body insets at 24px left/right, 16px top, and 0px bottom. A secondary page does not introduce a second nested page-padding wrapper.
- Back restores the parent page state, selection, filters, scroll position, and focus to the control that opened the secondary page. Back, browser/history navigation, or an equivalent platform command must not silently discard unsaved work.
- In the component gallery, show Form A at the secondary-page depth by default so the Back button and its title-left placement are directly inspectable; keep the return-to-parent interaction available for verification.

#### Form B: Open a new page

- Use when the secondary task should open as its own page rather than inherit the parent shell.
- A button or other page action may pop up this form. “Pop-up” describes how the user opens the page; it does not turn the page into a Dialog. Mount `Secondary Page Runtime` with `layout: "new-page"` in a viewport-level page host, keeping the parent page mounted underneath so Back/close can restore its exact state.
- Compose vertically: `Titlebar S` (`--height-titlebar-sm`, 40px) is the topmost region; content begins below it and is designed according to the task. Do not retain the original page's Primary Navigation or multi-pane geometry.
- The new page uses the standard content safe area: 24px left/right, 16px top, and 0px bottom. Its Titlebar is transparent and matches the white page surface below.
- Local save, confirm, or editing actions belong in the content heading or local action area. Window controls remain at the Titlebar's trailing edge.

- Hide a parent-specific Global Primary action while either secondary-page form is active. Keep it only when the action is genuinely application-global and remains valid at both depths.
- Do not model a Secondary Page opened by a button as Dialog or Semi-modal merely because it appears on top of the parent. Use Dialog/Semi-modal only when the background context must remain visible or the task is transient.
- In the component-gallery preview, keep Primary Navigation as quiet skeleton context for Form A and make the parent-to-secondary transition interactive. The preview must verify Back, `Escape` recovery, focus restoration, stable shell geometry, and the independently selectable Form B.

