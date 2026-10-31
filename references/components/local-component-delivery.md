# 页面本地组件与动态渲染

这个流程把模型负责的页面设计和脚本负责的组件交付分开。AI 根据三层路由与 page-brief.json 写页面参数；脚本将选中的组件入口与运行依赖放入页面项目。

## 读取范围

先读取 SKILL.md、当前操作路由和 page-brief.json v2 的路由导航，再用 query-resources.mjs 领取当前阶段的任务包。
组件名称/用途在 discovery 包；参数/插槽/变体/当前语义在 bindings 包，必须选择精确 ID 和语义。Token 用 --roles 精确查。
完整 context.json、聚合手册、组件总表与实现由脚本使用。需要细节时查询资源 ID 或单个 contractPath。详见 references/resource-workflow.md。

## 项目输出

~~~text
PROJECT_DIR/
  components/
    index.js                    本页可用的组件注册表
    component-manifest.json     选择结果、输入摘要、来源和输出摘要
    package.json                本地 ES module 边界
    button/
      index.js                  直接引用该组件实现的独立入口
      contract.json             此组件的原始契约
    <其他已选组件>/
    _runtime/
      packages/                 选中组件实现、共用工具、Pattern、CSS 与 Token 依赖闭包
  generated-page.js             页面组合与动态 renderGeneratedPage
  generated-entry.js            挂载、事件、组件初始化、截图就绪信号
  page-blueprint.json
  page-content-recipes.json
  page-bindings.json
  styles/
    index.css                   脚本生成的统一样式入口
    base.css                    脚本生成的视口基础样式
    page-composition.css        模型编写的业务容器布局
    style-manifest.json         样式依赖、加载顺序与摘要
  component-usage.json
  html-page-manifest.json
  index.html
  main.js
~~~

组件实现位于 `packages/components-html/src/<id>/index.js`，由契约的 `implementations.html` / `frameworks.html.source` 精确定位到 `#render`。组件专属函数与本体在同一目录，跨组件工具在 `shared/`，场景代码在 `gallery.js`。只读取受影响组件及必要 import，不读全量入口。

本页 `components/<id>/index.js` 直接引用 `_runtime` 中对应实现的 `render`。脚本沿所选组件的 import 复制传递依赖，复用工具只复制一次；不复制全量 `index.js`、`advanced.js` 和 `gallery.js`。标准 CSS、Token 和图标数据仍按现有规则共享。旧页面需重新解析当前路由并生成后才采用新结构，不直接改旧页面受管文件。


若检索后没有合适业务组件，另建 page-components/<id>/index.js 与 styles.css；这些是模型拥有的业务模块，与脚本管理的 components/ 分开。已有组件只引用原实现和样式，不重新生成。

### 文件维护职责

- 模型编写：page-blueprint.json、page-content-recipes.json、page-bindings.json、styles/page-composition.css；缺失业务能力时编写已声明的 page-components/<id>/index.js 与 styles.css。
- 脚本生成：components/、标准依赖、index.html、main.js、generated-page.js、generated-entry.js、样式入口和清单。调整页面时修改输入再生成，保留已有手改保护。
- 第一版预览也执行同一流程。无执行工具时交付输入并标记待生成；目录存在不代表源码、构建或浏览器验收通过。

生成的挂载入口同时初始化颜色变量统一标记，并将最后一次刷新纳入 __tuiReady。运行依赖随 components/_runtime/ 交付；同变量同类名，只标直接引用，范围详见 references/components/color-reference-markers.md。
## 两阶段命令

一键生成器会自动完成下面的组件准备。需要先交给另一个模型继续写页面时，也可以显式执行：

~~~bash
node "<RULES_ROOT>/scripts/prepare-page-components.mjs" \
  --project "<PROJECT_DIR>" --context "<PROJECT_DIR>/.text-to-ui/context-discovery.json" \
  --bindings "<PROJECT_DIR>/page-bindings.json" --skill-root "<RULES_ROOT>"
~~~

省略 --bindings 时，准备 Context Packet 当前选定的组件；提供 --bindings 时，仅准备实际绑定的组件。后续新增组件先重新解析能力，再重跑准备脚本。重复运行只更新自己的清单文件；遇到已被手改的管理文件会停止。

用同一参数加 --check 可检查依赖是否丢失或发生改动。生成器在组件准备和最终生成时核对材料与来源；来源变化后重新解析路由，修正输入再生成。


### 正式生成入口与完成检查

bindings 阶段先完成设计输入，validation 阶段运行当前任务包 commands.generate：new-page 使用 generate-compliant-page.mjs，normalize-demo 使用 normalize-demo.mjs 并提供原始项目和保留行为记录。该入口自动准备组件和样式；不必另跑上面的分阶段命令。生成命令包含 project、repo、skill-root、task、blueprint、content-recipes、bindings 和 page-css；路径包含空格时保留引号。

生成后运行当前包 commands.validate 与 commands.stylesCheck，检查空 HTML 宿主、独立组件与挂载模块、统一 CSS 入口、组件及样式来源摘要。失败时修正输入重新生成，不直接重写受管文件。之后构建并以 HTTP 打开，等待 #app.__tuiReady，验证实际交互、布局、字体和图片；分别报告源码、构建、浏览器及视觉状态。不执行脚本的模型交付设计输入并标记待生成，不能声称已完成运行验收。
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

## 页面调用

生成的页面导入本项目组件注册表：

~~~javascript
import { renderHtmlComponent } from "./components/index.js";
const saveButton = renderHtmlComponent("button", {
  label: "保存", variant: "primary", size: "standard", mode: "text"
});
~~~

此例仅展示调用形状。正式页面由严格生成器根据 Blueprint、配方、绑定和行为计划生成。组件内容必须通过支持的参数与插槽传入，几何由所选 Pattern Runtime 管理，页面 CSS 使用 Token。

