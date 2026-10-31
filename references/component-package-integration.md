# 本地 HTML 组件包使用
RULES_ROOT 为本技能绝对目录。packages 包含 HTML 实现、标准组件 CSS、Pattern Runtime、49个组件契约和 Tokens。生成器以本技能为默认规则与数据根，不查找父目录或全量仓库。
按 Workflow → Task → Pattern 路由，按精确组件ID和语义查询；已有组件由 prepare-page-components.mjs 复制到项目 components，公共依赖只复制一次。main.js 统一引入 styles/index.css，业务组件使用 page-components/<id>/ 独立模块和私有样式。
直接引用既有实现与标准样式；没有合适能力时登记查询结果后添加业务组件。受管文件有摘要与编辑保护，不手工覆盖。完整生成与检查流程见 SKILL.md 与 references/routes/new-page.md。
