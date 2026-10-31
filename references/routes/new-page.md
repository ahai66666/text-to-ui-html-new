# 新建页面任务流程：优先复用组件，缺失时独立创建

适用于本 Skill 生成的所有 HTML 页面，包括第一版预览。页面、组件和运行样式分别存放，其他模型先设计页面参数，缺失业务能力时另写独立模块和样式。

## 固定文件职责

| 文件 | 职责 |
| --- | --- |
| index.html | 空的 #app 挂载点和外部模块入口 |
| components/<id>/index.js | 选中组件的独立调用入口 |
| components/<id>/contract.json | 此组件的原始契约 |
| components/index.js | 本页可调用的组件注册表 |
| components/_runtime/ | 公共 HTML 工厂、Pattern、CSS 与 Token 依赖 |
| page-components/<id>/index.js 与 styles.css | 无现有能力时创建的业务组件及其样式，模型维护 |
| generated-page.js | 按 Pattern 动态组合并调用本地组件 |
| generated-entry.js | 挂载、事件绑定和渲染就绪信号 |
| main.js | 唯一导入 styles/index.css，再调用挂载模块 |
| styles/index.css | 脚本生成的样式总入口，按顺序引用标准样式与页面 CSS |
| styles/base.css | 脚本生成的视口基础样式 |
| styles/style-manifest.json | 脚本记录样式依赖、顺序和来源摘要 |
| styles/page-composition.css | 使用 Token 的业务分组布局 |

把整页控件内联进 HTML、重写现有组件 DOM 或复制组件样式，均不满足交付条件。

## 1. 先走三层路由

先选择 new-page 操作路由，再根据用户业务任务选择 Task route，最后解析该任务的 Layout Pattern。`--primary-task` 可从复杂请求中明确主任务；非默认但允许的布局需 `--pattern <id> --pattern-reason <原因>`。检查器 Pattern D 还记录 B/C 基础布局；不改变现有 Pattern 几何。任务多义时明确候选 ID，不按组件外观猜布局。

RULES_ROOT 是本精简版 Skill 的绝对路径，PROJECT_DIR 是页面项目目录。HTML 生成可直接使用本精简版目录。

~~~bash
node "<RULES_ROOT>/scripts/resolve-workflow-route.mjs" \
  --route new-page --repo "<RULES_ROOT>" \
  --receipt-out "<PROJECT_DIR>/.text-to-ui/route-read-receipt.json"

node "<RULES_ROOT>/scripts/resolve-context.mjs" \
  --task "<用户的业务任务>" --workflow-route new-page \
  --framework html --mode fast-preview --discover \
  --repo "<RULES_ROOT>" --skill-root "<RULES_ROOT>" \
  --out "<PROJECT_DIR>/.text-to-ui/context-discovery.json" \
  --brief-out "<PROJECT_DIR>/.text-to-ui/page-brief.json"
~~~

## 2. 按阶段领取短任务包

page-brief.json v2 只含路由、窗格/插槽、组件候选和下一步查询，不再预装组件 API 或全部 Token。完整 context-discovery.json 继续由脚本校验。先读取设计包：

~~~bash
node "<RULES_ROOT>/scripts/query-resources.mjs" \
  --stage design --context "<PROJECT_DIR>/.text-to-ui/context-discovery.json" \
  --view api --out-dir "<PROJECT_DIR>/.text-to-ui/packs/design"
~~~

读取包内 card 与 resources、pattern，完成 Blueprint；再用 discovery 包定位组件。先查询 bindings（不传组件）领取一次共用组合规范，然后按组件查询 API；只有共用包已经在当前模型上下文中时，才可加 `--scope component` 省略重复规范。换模型时一并交接共用包，或恢复默认 complete 范围。避免重复读取整页组合规则。例如查询保存按钮：

~~~bash
node "<RULES_ROOT>/scripts/query-resources.mjs" \
  --stage bindings --context "<PROJECT_DIR>/.text-to-ui/context-discovery.json" \
  --component button --semantic-context page-primary-action \
  --view api --out-dir "<PROJECT_DIR>/.text-to-ui/packs/button"
~~~

先形成配方和绑定，再可用 --bindings "<PROJECT_DIR>/page-bindings.json" 一次校对本页实际选择；不会预装路由默认所有组件。需要可选组件时，先在 resolve-context 中加 --capabilities <精确ID> 重新解析。styling 阶段按需传 --roles space/5,color/text；validation 只带当前模式的检查。

读取本流程后，每阶段只读当前 task-pack.json 或 task-pack.md 之一。design 包含输出目录与维护职责，bindings 包含组件准备与调用规则，styling 包含样式边界，validation 包含输出检查与正式生成命令。read-plan.json 用于追溯，聚合手册和实现源码无需进入常规页面上下文。使用没有本地工具的模型时，把当前包、任务与已确认的页面决策交给它，收回设计输入后由有工具的环境执行脚本。详见 references/resource-workflow.md。

## 3. 模型写页面输入

| 文件 | 必须记录 |
| --- | --- |
| page-blueprint.json | 用户任务、分组、实体、状态、交互、成功条件和 Pattern |
| page-content-recipes.json | 每个 Blueprint 分组如何通过组件组合实现 |
| page-bindings.json | logicalName、支持的 options/slots、semanticContext、behaviorPlan、stylePlan、composition |
| styles/page-composition.css | Token 布局和业务容器样式 |

先查组件库和本项目已有业务组件：有组件则直接引用，用参数、插槽和数据组装，保留原实现与样式。不要重新生成已有组件。

没有合适组件时，先在配方记录检索和候选不适用原因，再新建 page-components/<id>/index.js 与 styles.css。pageModules 声明 compositionId、source、stylesheet；模块导出 mount(host, { renderComponent })，内部标准控件仍调用已有组件。页面 CSS 只负责组件之间的排列，业务组件自己的 CSS 留在其目录。已有共享组件本身需修正时走维护流程。

## 4. 引用已有组件，装配已有样式

一键入口自动执行 scripts/prepare-page-components.mjs：按实际绑定为已有组件建立调用入口，复制原始实现依赖，记录来源摘要，阻止未登记组件和不支持的参数。分阶段准备的命令见 references/components/local-component-delivery.md。

随后 scripts/prepare-page-styles.mjs 生成 styles/index.css、base.css 和样式清单，并接入 main.js。模型写页面组合 CSS，缺失能力的业务组件独立编写其 CSS 并由 pageModules.stylesheet 声明；样式入口自动收集：不写 @import，不读写标准组件 CSS，不覆盖 Pattern 几何。标准 CSS 保留原始依赖并由统一入口加载，详见 references/components/local-component-delivery.md。

components/ 与样式总入口由脚本维护；page-components/ 中的新业务模块及其 CSS 由模型维护，可再次引用。实现按组件分目录，通过契约定位并沿 import 复制传递依赖；公共工具只复制一次，全量注册入口和预览场景不进入页面运行时。

## 5. 页面引用组件并动态渲染

~~~bash
node "<RULES_ROOT>/scripts/generate-compliant-page.mjs" \
  --project "<PROJECT_DIR>" --repo "<RULES_ROOT>" --skill-root "<RULES_ROOT>" \
  --framework html --task "<同一业务任务>" --route new-page --mode fast-preview \
  --blueprint "<PROJECT_DIR>/page-blueprint.json" \
  --content-recipes "<PROJECT_DIR>/page-content-recipes.json" \
  --bindings "<PROJECT_DIR>/page-bindings.json" \
  --page-css "<PROJECT_DIR>/styles/page-composition.css"
~~~

此入口解析已确认的 Context Packet，验证 Layout Contract、Blueprint、配方、绑定、Token 和组件来源，然后准备组件与统一样式入口，再生成页面模块。页面通过 components/index.js 调用真实 HTML 工厂。失败时修正对应输入并重新生成。

## 6. 查看真实页面

先执行 `node "<RULES_ROOT>/scripts/validate-page-project.mjs" --project "<PROJECT_DIR>" --skill-root "<RULES_ROOT>"`；无浏览器证据只报告源码通过。然后在项目安装可用的 Vite 依赖，构建并打开 HTTP 预览。等待 document.querySelector("#app").__tuiReady，确认 data-tui-ready="ready"，再检查实际布局、主要交互和组件证据。

完成条件：
1. index.html 为宿主；页面、组件和样式分别存放，main.js 统一加载 CSS。
2. 组件来自当前路由，参数符合契约，来源摘要有效。
3. Pattern 管理窗格、标题、插槽和滚动；业务 CSS 使用 Token。
4. 组件实际渲染，主要交互可操作。
5. 明确报告生成、构建、浏览器和视觉检查各自的完成状态。

## 7. 验收与交接后结束

源码、构建和浏览器验收分别记录；视觉结果如未验证，应明确写为 pending。必需证据通过后，运行 `node "<RULES_ROOT>/scripts/html-handoff.mjs" create --project "<PROJECT_DIR>" --url "<preview-url>" --evidence "<relative-validation-evidence.json>"`，保留组件、样式与页面依赖摘要，HTML 流程结束。

只有用户要求导入画板时，才将已确认页面与 html-handoff.json 交给独立的 text-to-ui-pixso；本技能不执行导入阶段。
