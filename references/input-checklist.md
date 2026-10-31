# Input Checklist

Use this reference when the user asks what to provide, or when a project needs stronger control than a one-sentence request.

This is optional guidance for the user, not a mandatory intake form. For normal runs, follow the adaptive question policy in `requirement-spec.md`.

## Minimum Input

A single sentence is enough:

`做一个文件管理工具，可以搜索、整理文件并在右侧预览，最后输出 HTML。`

When details are missing, infer reasonable defaults and continue.

## Better Input

Ask the user to provide any of these if they want stronger control:

- Tool type: management, processing, monitoring/analysis, configuration, editing, browsing/organization, inspection/troubleshooting, or command/automation.
- Primary user: operator, administrator, creator, analyst, developer, consumer, student, or another role.
- Main work object: file, order, task, content item, device, dataset, configuration, document, or another object.
- Primary task, workflow start, and success result.
- Usage frequency, time pressure, required state preservation, and failure/recovery behavior.
- Permissions, publishing, destructive actions, privacy, or other high-risk rules.
- Style and brand direction when it should affect content-expression modules.
- Palette: primary color, forbidden colors, light/dark mode.
- Language: Chinese, English, bilingual.
- Desktop window constraints or special HarmonyOS behavior.
- Required interactions: navigation, form validation, filtering, selection, dialogs, menus, loading, empty and error flows.
- Required UI: nav, login form, charts, table, cards, timeline, upload area, editor, chat, map, pricing cards.
- Assets: logo, screenshots, product photos, icons, brand guide.
- Existing system: `design.md`, CSS variables, Pixso component library, style guide, existing pages, component code.
- Deliverable: Pixso only, HTML only, or Pixso plus HTML.

## Prompt Template

```text
用 text-to-ui 流程，帮我做一个 [页面类型]。
产品/工具：[名称和用途]
主要用户：[角色和使用场景]
主要对象与任务：[操作什么，完成什么]
频率与风险：[高频/低频、时间压力、危险或权限操作]
风格参考：[已有产品/设计系统/关键词]
必须包含：[组件列表]
已有资料：[design.md/Pixso/组件库/品牌素材/无]
窗口要求：[默认 1728×1152/其他桌面尺寸]
关键交互：[填写、校验、筛选、选择、弹窗、跳转等]
生成方式：[首推：HTML 初稿 → Pixso 细化 → 最终 Demo / Pixso 优先 / 直接生成 HTML]
交付：[HTML 初稿 + 可编辑 Pixso + 最终可交互 Demo / 可编辑 Pixso + 可交互 HTML / 可交互 HTML]
文件放到我的代码仓。
```

## Decision Rules

- If the user says "先生成 HTML 初稿", "HTML 导入 Pixso", "代码转设计稿", or describes the full draft → design → demo loop, select HTML-first refinement.
- If the user explicitly asks to create and approve the Pixso visual before any user-visible HTML, select visual-first.
- If the user explicitly asks to skip Pixso or deliver HTML only, select direct HTML.
- Otherwise default to HTML-first refinement, state the assumption in the Tool Task Brief, and continue without a blocking workflow-selection question.
- If the user provides a Pixso document or top-level Frame reference, inspect it first when Pixso MCP tools allow.
- If the user provides `design.md` or an existing codebase, read it before inventing style.
- If no `design.md` exists and consistency matters, create one.
- If the request is a desktop tool, classify the tool from the user's job and work object before selecting a shell.
- If brand assets are missing, use a restrained project layer over the bundled HarmonyOS baseline instead of inventing a marketing identity.
