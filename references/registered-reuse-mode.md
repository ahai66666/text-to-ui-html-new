# 注册组件复用

HTML 使用当前契约、真实工厂、项目 components/index.js 和标准样式。Blueprint 决定任务和结构；来源、选择收据与实际运行证据共同证明复用。要求见 html-component-reuse-gate.md。

Pixso 正常导入使用同一已渲染页面及 DOM Visual IR，经 Unified Agent 创建兼容 Instance。缺失或几何不兼容的可选映射保留浏览器测量的原生组合并记录原因；它不算实例，不等于严格组件一致性通过。无安全实现的契约错误仍阻断。

实例颜色属于所选 Variant，不能用 HTML 颜色覆盖修补。变量、样式、mainComponent、Variant 和插槽必须实时回读。正常导入、组件库修复和诊断边界见 pixso-execution-invariants.md。
