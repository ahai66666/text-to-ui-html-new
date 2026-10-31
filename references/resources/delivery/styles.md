## 样式装配与读取边界

一键生成器在组件准备后自动执行 scripts/prepare-page-styles.mjs。main.js 只导入 styles/index.css，然后调用挂载模块；generated-page.js 和 generated-entry.js 不导入 CSS。index.html 不包含内联样式或额外样式链接。

加载顺序固定为：canonical Tokens → styles/base.css → 标准 HTML 组件样式 → Pattern shell → Pattern Runtime → pageModules 声明的业务组件 CSS → styles/page-composition.css。标准组件样式内部已有自己的依赖引用，保持其原始关系，由构建工具处理。不要为了目录对称把共享 CSS 拆成 49 份。

已有组件的实现和 CSS 直接复用，脚本只复制与引用。缺失能力时创建 page-components/<id>/index.js 与 styles.css，通过 pageModules.source/stylesheet 声明。新业务组件内部的标准控件仍调用原组件。styles/page-composition.css 只负责页面组合。不在其中写 @import、复制组件内部规则或覆盖 Pattern 几何。新增组件后重新走组件准备与样式装配；不要手工改管理文件。

在组件与宿主已准备好后，可单独装配或检查：

~~~bash
node "<RULES_ROOT>/scripts/prepare-page-styles.mjs" --project "<PROJECT_DIR>"
node "<RULES_ROOT>/scripts/prepare-page-styles.mjs" --project "<PROJECT_DIR>" --check
~~~

默认页面 CSS 为 styles/page-composition.css。已有项目可以显式传 --page-css "<PROJECT_DIR>/page-composition.css"，保留原文件位置。旧脚本生成的 main.js 与精确的基础内联 reset 可自动迁移；自定义主入口、额外内联样式、手改的管理样式会停止并提示冲突，不覆盖业务代码。组件/样式清单的来源与输出摘要必须匹配；失败时恢复本次准备前的管理文件。

