# HTML 页面交付约束
动态 HTML 使用空 index.html 宿主，页面引用独立组件，挂载与事件独立。main.js 统一加载 CSS；模型只编写业务组合与声明的私有业务样式，标准组件、Token 和 Pattern 由脚本交付。保留 Workflow → Task → Pattern 三层决策，按当前阶段查询资料。已有 Demo 保留已确认的内容、状态与交互。源码通过不等于构建或浏览器通过；页面验收后生成交接清单。

## 组件身份节点
组件契约的 `identityNode` 决定 `data-component`、`data-renderer-key`、`data-logical-component` 等身份属性的承载节点，不默认等于布局根。Accordion/Collapsible 的身份必须位于直接触发按钮 `.tui-disclosure__trigger`；外层 `.tui-disclosure` 只组织按钮与内容，不重复登记身份。按钮通过 `aria-controls` 关联自身内容区域；内容中的组件单独登记。采集边界取身份节点，运行时校验拒绝外层标记、缺失身份节点证据或状态不一致，不能由采集器猜测后移标签。旧页面须重新准备组件和样式、构建、浏览器验收并刷新 handoff，线上包不会随技能修改自动更新。
