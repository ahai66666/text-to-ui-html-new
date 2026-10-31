本文件用于共享规范的精确维护查询。当前 Token、组件契约和 Pattern 数据决定数值；示例不授权覆盖标准运行时。标题栏遵守当前 titlebar 主题与适配器。

## 4.6 Shadows

```css
--shadow-1: 0 0 4px 0 rgb(0 0 30 / 15%);
--shadow-2: 0 0 20px 0 rgb(0 0 30 / 8%);
--shadow-3: 0 10px 50px 0 rgb(0 0 30 / 15%);
--shadow-4: 0 10px 50px 0 rgb(0 0 30 / 30%);
--shadow-5: 0 10px 55px 0 rgb(0 0 30 / 25%);
--shadow-6: 0 10px 70px 0 rgb(0 0 30 / 45%);
```

`elevation` is interpreted as the blur radius for CSS and Pixso shadow effects. Spread is `0` for every level. The shared shadow color is `#00001E`; opacity is stored independently in machine-readable tokens.

### Projection Usage Policy

```text
共享投影 Token 的常规使用场景只有以下九类浮层的外层容器：
Snackbar: shadow-1
Tooltip: shadow-1
Popover: shadow-2
Hover Card: shadow-2
Dropdown Menu: shadow-2
Context Menu: shadow-3
Dialog: shadow-4
Alert Dialog: shadow-4
Semi-modal: shadow-5

其他场景一般不使用投影，默认以边框或批准的表面色差区分层级；Focus 使用 Focus Ring Token。普通 Toast、Select/Combobox 的选项列表、独立 Calendar、Menubar 栏本体、卡片、页面面板、窗口壳层、选中和聚焦状态默认无投影。Dropdown Menu（含 Menubar 展开的命令菜单）的面板使用 shadow-2；Input / Tag Entry 的建议列表复用 Dropdown Menu 面板与菜单项样式（含 shadow-2），但仍保留 listbox/option 语义，这属于 Dropdown Menu 样式复用而非新增通用投影场景；Context Menu 的面板使用 shadow-3。若具体项目确需例外，须在该项目设计系统中明确场景与效果，不自动扩展为 Text-to-UI 的通用投影 Token 角色。shadow-6 保留为兼容性基础样式，不分配常规场景。
```

Context Menu / 上下文菜单: every menu item uses a horizontal semantic icon + text structure. The leading icon is exactly 24×24px (`--icon-size-lg`) and the icon-to-text gap uses `--gap-menu-item-content` (8px). Do not render Context Menu commands as text-only rows.

Dropdown Menu and Context Menu panels use `--padding-popup-menu` on both horizontal sides (4px). Therefore the hover/focus surface of each menu item starts 4px inside the panel's left and right border; keep the item text inset at `--padding-menu-item-x` (12px) and do not remove the panel inset or compensate it with a negative margin.

### Date Picker · 日期选择器

- 客户端日期选择器使用组件库自绘的 Calendar Popover，不使用浏览器原生 `input[type="date"]` 下拉层。
- 触发字段高度引用 `--height-input`，Popover 使用 raised surface、`--radius-card`、边框色与 `--shadow-2`。
- 月份栏高度 40px；日期固定为完整 6×7 网格，日期热区 32px，星期标签使用 Body S，月份标题使用 Subtitle S。
- 默认日期使用一级文本色，相邻月份使用次级文本色；选中日期使用品牌背景与反白文字；今天在未选中时使用品牌色描边。Hover、Pressed 与 Focus 分别引用对应状态层和 focus ring。
- 底部“清除”“今天”使用 Small Ghost Button。方向键按日/周移动，Escape 关闭且焦点返回触发字段。

### Time Picker · 时间选择器

- 客户端时间选择器使用组件库自绘 Popover，默认采用 24 小时制，分钟步进为 5；不要使用浏览器原生 `input[type="time"]` 下拉层。
- 触发字段高度引用 `--height-input`；Popover 使用 raised surface、`--radius-card`、边框色与 `--shadow-2`。
- 小时与分钟分列为两个透明背景的 Listbox，不使用灰色列底；列标题使用 Body S，弹层标题使用 Subtitle S，选项使用 Body L；列表高度 144px，单项高度 32px。触发字段右侧使用 16px `field/time` 时钟图标，展开时保持静止。
- 默认选项使用一级文本色，选中项使用 Ghost 样式：品牌色文字、透明背景；Hover、Pressed 与 Focus 引用对应状态层和 focus ring，不得使用品牌实底与反白文字。
- “清除”“现在”使用 Small Ghost Button，“确定”使用 Small Primary Button。时/分选择先保留为草稿，确定后提交；Escape 或点按外部放弃草稿并关闭。

