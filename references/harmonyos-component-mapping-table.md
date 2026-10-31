# HarmonyOS 源组件 → Text-to-UI 注册组件全量映射表

> 该表由 `scripts/build-harmonyos-component-mapping-table.mjs` 生成。映射成功只表示已找到源组件；只有 `verified` 才能进入严格交付。

- 注册组件：80
- 已映射待验证：16
- 已映射需重建：4
- 已验证：0
- 缺失待补：60

| 分类 | Text-to-UI 注册名 | 状态 | HarmonyOS 源组件 | 源 Variant | 下一步 |
| --- | --- | --- | --- | --- | --- |
| 01 Actions | Button/Primary/Default | mapped-pending-verification | Button | size=Medium, state=Default, type=Primary | Finish the registered target and verify it live in Pixso before strict delivery. |
| 01 Actions | Button/Secondary/Default | mapped-pending-verification | Button | size=Medium, state=Default, type=Secondary | Finish the registered target and verify it live in Pixso before strict delivery. |
| 01 Actions | Button/Ghost/Default | mapped-pending-verification | Button | size=Medium, state=Default, type=Ghost | Finish the registered target and verify it live in Pixso before strict delivery. |
| 01 Actions | Icon Text Button/Primary/Default | mapped-pending-verification | icon-text | size=Medium, state=Default, type=primary | Finish the registered target and verify it live in Pixso before strict delivery. |
| 01 Actions | Icon Text Button/Secondary/Default | mapped-pending-verification | icon-text | size=Medium, state=Default, type=secondary | Finish the registered target and verify it live in Pixso before strict delivery. |
| 01 Actions | Icon Text Button/Ghost/Default | mapped-pending-verification | icon-text | size=Medium, state=Default, type=ghost; alias Icon + Text: 尺寸=Medium, 类型=Normal, 状态=Enabled | Finish the registered target and verify it live in Pixso before strict delivery. |
| 01 Actions | Icon Button/Ghost/Default | mapped-pending-verification | Icon Button | size=Medium, state=Default, type=Ghost; alias Iconbutton: 尺寸=Medium, 类型=Normal, 状态=Enabled | Finish the registered target and verify it live in Pixso before strict delivery. |
| 01 Actions | Icon Button/Secondary/Default | mapped-needs-rebuild | Icon Button | size=Medium, state=Default, type=Ghost | Rebuild the registered target from the mapped native source, then pass Token, icon, text-slot, layout, and linked-instance gates. |
| 01 Actions | Split Dropdown Button/Icon Text/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 01 Actions | Split Dropdown Button/Icon Only/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 01 Actions | Dropdown Menu/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Chips | Chips/Default | mapped-pending-verification | Chips | 状态=Default | Finish the registered target and verify it live in Pixso before strict delivery. |
| 02 Forms | Form Field/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Field/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Field/With Description | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Input/White Surface/Default | mapped-pending-verification | Input | surface=white, state=Default | Finish the registered target and verify it live in Pixso before strict delivery. |
| 02 Forms | Input/Gray Surface/Default | mapped-pending-verification | Input | surface=dark, state=Default | Finish the registered target and verify it live in Pixso before strict delivery. |
| 02 Forms | Input/Tag Entry/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Search/White Surface/Default | mapped-pending-verification | Search | surface=white, state=Default | Finish the registered target and verify it live in Pixso before strict delivery. |
| 02 Forms | Search/Gray Surface/Default | mapped-needs-rebuild | Search | surface=dark, state=Default | Rebuild the registered target from the mapped native source, then pass Token, icon, text-slot, layout, and linked-instance gates. |
| 02 Forms | Search/Scoped/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Textarea/White Surface/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Textarea/Gray Surface/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Select/White Surface/Default | mapped-needs-rebuild | Selection Dropdown | size=Medium, state=Default | Rebuild the registered target from the mapped native source, then pass Token, icon, text-slot, layout, and linked-instance gates. |
| 02 Forms | Select/Gray Surface/Default | mapped-needs-rebuild | Selection Dropdown | size=Medium, state=Default | Rebuild the registered target from the mapped native source, then pass Token, icon, text-slot, layout, and linked-instance gates. |
| 02 Forms | Combobox/White Surface/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Combobox/Gray Surface/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Input OTP/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Number Selector/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Checkbox/Unchecked/Default | mapped-pending-verification | CheckBox | checked=false, state=Default | Finish the registered target and verify it live in Pixso before strict delivery. |
| 02 Forms | Radio/Unselected/Default | mapped-pending-verification | Radio | checked=false, state=Default | Finish the registered target and verify it live in Pixso before strict delivery. |
| 02 Forms | Switch/Off/Default | mapped-pending-verification | Switch | checked=false, state=Default | Finish the registered target and verify it live in Pixso before strict delivery. |
| 02 Forms | Slider/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Segmented Button/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | ColorPicker/Tablet | mapped-pending-verification | Snackbar/ColorPicker-Tablet |  | Finish the registered target and verify it live in Pixso before strict delivery. |
| 02 Forms | Selection Dropdown/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Date Picker/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 02 Forms | Time Picker/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Titlebar/S/Normal | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Titlebar/M/Normal | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Titlebar/L/Normal | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Titlebar/XL/Normal | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Sidebar Item/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Sidebar Group Header/Collapsed | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Primary Level Icon/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Menubar/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Tabs/Filled/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Tabs/Line/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Tabs/Vertical/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Breadcrumb/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Pagination/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Pagination Item/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Sub Tabs/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Accordion/Collapsed | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 03 Navigation | Collapsible/Collapsed | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | Metric Card/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | List Item/White Surface/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | List Item/Gray Surface/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | List Container/White Canvas | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | List Container/Gray Canvas | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | Table/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | Table Header/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | Table Row/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | Badge/Neutral | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | Badge/Info | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | Badge/Success | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | Badge/Warning | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | Avatar/32/Image | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | Avatar/32/Fallback | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | Avatar/40/Image | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | Avatar/40/Fallback | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 04 Data Display | Progress/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 05 Feedback | Alert/Info | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 05 Feedback | Alert/Success | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 05 Feedback | Alert/Error | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 05 Feedback | Alert/Warning | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 05 Feedback | Alert/Neutral | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 05 Feedback | Snackbar/Default | mapped-pending-verification | Snackbar | 左侧区域=1 | Finish the registered target and verify it live in Pixso before strict delivery. |
| 05 Feedback | Dialog/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |
| 05 Feedback | Tooltip/Default | missing-target |  |  | Add a source mapping or draw a new registered target, then verify it live in Pixso. |

## 仅作源参考

| HarmonyOS 源组件 | 原因 |
| --- | --- |
| Toggle-状态按钮-2in1 | Its segmented 72x28 behavior does not match the registered desktop Toggle/Off component. |
| ScrollBar-Phone | Platform utility, not a registered reusable component in the current scope. |
| .2in1 Container | Dialog dependency only. |
| .text | Dialog dependency only. |
| Dialog-2in1 | Pixso component exists, but Dialog-2in1 still needs an explicit HTML contract mapping. |
| Search-Second Page-2in1 | Composite secondary-page pattern, not a primitive Search component. |

