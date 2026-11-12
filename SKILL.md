---
name: text-to-ui-html-new
description: Generate or revise HarmonyOS PC HTML prototypes with controlled component interfaces and canonical Patterns. Use compact page inputs and deliver multi-file offline packages that render dynamically without a server or Vite.
---

# Text to UI HTML New

独立技能；不修改或依赖旧 text-to-ui-html 安装。RULES_ROOT 是本目录，PROJECT_DIR 是独立页面目录。

## 选择执行方式

单一明确修改走下方短流程。复杂页面或预计跨会话时，先读 [分步执行与接续](references/stepwise-workflow.md)：先定需求、Pattern 和公共数据/事件接口，再生成能打开的最小页面；随后按业务模块逐个完成输入、生成和必要修正，最后串联。使用 work-plan.mjs 保存项目进度，恢复时只读当前步骤的材料。已有计划先 resume，不从头分析。

## 最短流程

1. 读 [消费输入](references/consumer-input.md)，确认用户任务与必要业务事实。修改本技能生成的页面时，沿用原 page-input.json；规范化外部 Demo 时先读 [Demo 保留](references/consumer-normalize.md)。
2. 用 `discover-page.mjs --task "<任务>"` 获取当前 Pattern 的分段、槽位和滚动归属。用 `consumer.mjs find "<用途>" --pattern <ID> --region <窗格>`，再 `describe <精确ID...> --context <语义>`。只读当前查询，默认不读完整索引、源码或机器追溯文件。有多个场景时必须选 context，精确能力别名可自动确定场景。
3. 模型只写 PROJECT_DIR/page-input.json；已有规则固定的参数不要填写。不造业务默认值。
4. `node "<RULES_ROOT>/scripts/page.mjs" generate --project "<PROJECT_DIR>"`。局部修改加 `--revision` 继承布局。
5. 打开返回的 `out/<页面ID>/index.html`，直接 file:// 动态运行。默认交付整个多文件文件夹：外部经典脚本、CSS、本地资源与 `src/` 模块化源码；无需服务、Vite 或 npm install。分享时打包整个文件夹。

导出与交付结构见 [离线交付](references/offline-delivery.md)；只在需要单文件时加 `--format single-file`。

## 能力缺口与正式入口

消费接口不足时先查组合；需要状态、事件或动态内容时，读 [业务扩展](references/business-extension.md)，用 business-module.mjs 在现有分组内扩展。不能因编译受限而另写整页 HTML。真实 AI 服务与离线演示需明确区分。

生成后用 `page.mjs entry --project "<PROJECT_DIR>"` 获取唯一正式预览入口和状态；源码入口与交付入口可以并存，不形成两套业务实现。已有手写 HTML 保留作参考并迁回业务模块，不自动删除。

## 按需上下文

Pattern B 的当前对象级操作用 `detailActions`，列表搜索用 `secondary-list-search`。程序负责标题分段、滚动与窗口控件。局部修改只查询受影响组件；完整 resolve-context 留给脚本。

组件接口按 ID＋context 读取一次；同一调用重复 ID 自动去重。长任务可加 `--write-state "<PROJECT_DIR>/.text-to-ui/query-state.json"` 保存已读版本，下次 describe 带 `--since` 和同一路径的 `--write-state`，只返回变化接口。仅在当前对话或交接中仍保留已读接口时复用状态文件；新会话若无交接，不带 --since。完整契约及实现依赖变化会使接口缓存失效。

## 边界

Task 限定可选 Pattern；非默认布局需 patternReason。Pattern 管窗格、标题和滚动，组件管内部外观，组合管槽位内排列。只用公开参数，不覆盖固定参数、内部 class 或标准 CSS。

已有组件优先；缺口先记录查询与候选。复杂模块读 [消费输入](references/consumer-input.md) 的业务模块部分。模型不修改 generated-*、components/、.text-to-ui/compiled 或 styles/page-composition.css；特殊样式使用 businessCss。

生成输出不代表业务、浏览器或视觉全部通过；沿用现有必要检查，不追加审查流程。无执行工具时只交输入并标记待生成。远程后端不属于离线原型能力。

普通任务不读 references/routes/ 的低层文件，不混写 Blueprint/bindings；低层模式只用于 consumer-input.md 指明的复杂输入。特殊能力才用 `consumer.mjs describe <id> --full`；维护与分发只读维护项目的 maintenance/README.md。
