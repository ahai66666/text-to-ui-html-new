---
name: text-to-ui-html-new
description: Generate or revise HarmonyOS PC HTML prototypes with controlled component interfaces and canonical Patterns. Use compact page inputs and deliver multi-file offline packages that render dynamically without a server or Vite.
---

# Text to UI HTML New

独立技能；不修改或依赖旧 text-to-ui-html 安装。RULES_ROOT 是本目录，PROJECT_DIR 是独立页面目录。

## 最短流程

1. 读 [消费输入](references/consumer-input.md)，确认用户任务与必要业务事实。修改本技能生成的页面时，沿用原 page-input.json；规范化外部 Demo 时先读 [Demo 保留](references/consumer-normalize.md)。
2. `node "<RULES_ROOT>/scripts/consumer.mjs" find "<用途>"`，再 `describe <精确ID...> --context <语义>`。只读当前查询，默认不读完整索引、源码或机器追溯文件。
3. 模型只写 PROJECT_DIR/page-input.json；已有规则固定的参数不要填写。不造业务默认值。
4. `node "<RULES_ROOT>/scripts/page.mjs" generate --project "<PROJECT_DIR>"`。
5. 打开返回的 `out/<页面ID>/index.html`，直接 file:// 动态运行。默认交付整个多文件文件夹：外部经典脚本、CSS、本地资源与 `src/` 模块化源码；无需服务、Vite 或 npm install。分享时打包整个文件夹。

导出与交付结构见 [离线交付](references/offline-delivery.md)；只在需要单文件时加 `--format single-file`。

## 边界

Task 限定可选 Pattern；非默认布局需 patternReason。Pattern 管窗格、标题和滚动，组件管内部外观，组合管槽位内排列。只用公开参数，不覆盖固定参数、内部 class 或标准 CSS。

已有组件优先；缺口先记录查询与候选。复杂模块读 [消费输入](references/consumer-input.md) 的业务模块部分。模型不修改 generated-*、components/、.text-to-ui/compiled 或 styles/page-composition.css；特殊样式使用 businessCss。

生成输出不代表业务、浏览器或视觉全部通过；沿用现有必要检查，不追加审查流程。无执行工具时只交输入并标记待生成。远程后端不属于离线原型能力。

特殊能力才用 `consumer.mjs describe <id> --full`；维护与分发只读维护项目的 maintenance/README.md。
