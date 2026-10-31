# 精简版 Text-to-UI：快速路由与调用说明

这份说明给读取本目录的 AI 使用。目录安装为 Skill 后，可用 `$text-to-ui-html` 调用。目标是先确定正确流程，再只提取该任务实际需要的 Pattern、组件契约和参考资料。

## 一句话记住三层

1. **Workflow route：要做什么操作？** 选择新建、精确修改、导入 Pixso、维护组件库、排错或维护 Skill。
2. **Task route：页面服务什么业务任务？** 选择业务域、预设 Pattern 和初始组件能力。
3. **Layout Pattern：页面骨架怎样组织？** 约束窗格顺序、插槽、滚动、缩放和尺寸。

三层完成后才做组件资源查找：用组件能力索引找到唯一 `contractPath`，只读对应组件文件。组件文件查找是资源解析步骤，不是第四种页面决策。

## 第一层：操作路由

| 用户意图 | Workflow route | 继续阅读 |
| --- | --- | --- |
| 新建页面或大幅重做页面 | `new-page` | `references/routes/new-page.md` |
| 对已批准的页面做一项精确改动 | `micro-revision` | `references/routes/micro-revision.md` |
| 把指定的现有 HTML 导入 Pixso，不重设计 | `existing-html-to-pixso` | `references/routes/existing-html-to-pixso.md` |
| 新建、修复或同步 Pixso 组件库 | `pixso-component-library` | `references/routes/pixso-component-library.md` |
| 诊断 HTML 到 Pixso 的失败导入 | `converter-diagnosis` | `references/routes/converter-diagnosis.md` |
| 修改或审计本 Skill | `skill-maintenance` | `references/routes/skill-maintenance.md` |

操作不明确时先问清目标。不要把“修改 HTML 页面”自动当成 Pixso 导入，也不要把新建页面当作精确修订。

## 第二层：业务任务路由

在 `references/index/task-routes.source.json` 中匹配用户任务；运行时索引是 `references/index/generated/task-router.json`。

| Task route ID | 常见任务词 | 预设 Pattern |
| --- | --- | --- |
| `communication-workbench` | 邮件、邮箱、Coremail、mail workbench | `pattern-b-three-pane` |
| `record-management-workbench` | 联系人、任务管理、记录管理、records | `pattern-b-three-pane` |
| `dashboard-or-settings` | 仪表盘、设置、内容中心、dashboard | `pattern-a-two-pane` |
| `tool-workspace` | 文件管理、编辑器、素材管理、tool workspace | `pattern-c-tool-workspace` |

匹配会先做 Unicode NFKC 和大小写归一；完整任务词、别名或业务域词优先于普通词片段。若有多个候选，停止自动选择，列出候选 ID，并用 `--task-route <id>` 明确选择；显式 ID 必须与用户任务匹配。没有候选时不得猜业务域。

未知业务任务只有在用户或 Blueprint 明确给出布局与所需能力后才能继续：传入 `--pattern <canonical-pattern-id>` 和 `--capabilities <component-id,...>`。不要从组件名字倒推页面布局。

## 第三层：页面骨架

布局来源是 `references/index/layout-routes.source.json`；几何契约以 `assets/design-system/pattern-contracts.json` 为准。

| Pattern ID | 适用结构 |
| --- | --- |
| `pattern-a-two-pane` | 主导航 + 内容区，适合浏览、仪表盘和设置 |
| `pattern-b-three-pane` | 主导航 + 列表 + 详情，适合邮件和记录工作台 |
| `pattern-c-tool-workspace` | 主导航 + 工具工作区，适合编辑器、文件和素材操作 |
| `pattern-d-inspector` | 仅在确有检查器需求时扩展 Pattern B 或 C；它不是独立业务路由 |

已匹配的 Task route 所绑定的 Pattern 是权威值。显式 `--pattern` 与它冲突时，路由器会阻止继续；先修正任务判断或 Blueprint，不要绕过冲突。

## 组件与资料的精准读取

1. 从 `references/index/generated/component-index.json` 按能力查找；组件 ID 是最精确的调用键。
2. 若能力名是唯一别名，使用它对应的契约路径。若别名有多个候选，使用具体组件 ID；有语义上下文规则时，用 `query-components.mjs --context <context>` 查询。
3. 只读 `packages/component-contracts/src/components/<id>.json` 中列出的契约。不要为了找一个组件读取整个 `components.json`。
4. `requiredCapabilities` 会进入当前 Context Packet；`optionalCapabilities` 只是候选名称，不预加载契约。用户或 Blueprint 选中可选项后，通过 `--capabilities <id,...>` 加载它。
5. 没有注册契约时，明确返回“无匹配组件”，不要伪造 `contractPath`。只有确认组件库不适用且业务确实需要时，才提出页面级自定义组合。

需要区分按钮语义或列表行语义时，先查上下文规则：

```bash
node "<RULES_ROOT>/scripts/query-components.mjs" \
  --repo "<REPO_ROOT>" --skill-root "<RULES_ROOT>" \
  --capabilities icon-button --context toolbar-action
```

`select` 同时是具体组件 ID 和多个选择控件共用的别名。`query-components --capabilities select` 会列出 `combobox`、`native-select`、`select` 三个候选及各自的契约路径；根据交互需求确定后，再把具体 ID 传给 `resolve-context --capabilities`。直接传入具体 ID 时，解析器优先采用 ID 精确匹配。

模型读取 page-brief.json v2 导航，再通过 query-resources.mjs --stage <阶段> 读取当前任务包。完整 Context Packet 的 componentReadMap、patternContract、materials 与 exactReferencesToRead 保留为机器校验和兼容材料，不作为模型默认阅读清单。组件参数从 bindings 包按 ID/语义取得，样式阶段按 Token 角色查询。详见 references/resource-workflow.md。

## 所有 HTML 输出的固定流程

所有模型都执行：三层路由 → 短导航 → 按阶段领取任务包 → 写页面输入 → 脚本准备独立 components/ → 页面引用组件动态渲染 → HTTP 预览检查 → 按需导入 Pixso。第一次预览也走此流程。index.html 只包含空挂载点和模块入口，详细步骤以 references/routes/new-page.md 为准。

模型默认读 --brief-out 生成的短摘要。完整 Context Packet、聚合组件库和运行时源码只作为脚本材料；需要参数细节时读取单个契约。组件通过 components/<id>/index.js 和 components/index.js 交付给页面。

## 最小调用参数

新建页面的路由解析至少需要：

```text
--task <用户的业务任务描述>
--workflow-route new-page
--framework html
--mode fast-preview
--discover
--repo <可用的 Text-to-UI 仓库根目录绝对路径>
--skill-root <本精简版 Skill 目录绝对路径>
```

按需增加：

| 参数 | 什么时候传 |
| --- | --- |
| `--task-route <id>` | 任务词匹配多个业务路由，且已确认正确候选 |
| `--pattern <id>` | 未知任务，且布局已由用户或 Blueprint 明确指定 |
| `--capabilities <id,...>` | 用户或 Blueprint 明确需要的附加组件；用逗号分隔精确 ID |
| --brief-out <path> | 输出给模型阅读的短摘要；完整 Context Packet 留给脚本 |
| `--out <path>` | 保存 Context Packet；推荐放在项目 `.text-to-ui/` 下 |
| `--receipt-out <path>` | 保存可核对的材料读取收据 |

注意参数名：`resolve-context.mjs` 使用 `--workflow-route`；工作流解析器和一键生成器使用 `--route`；业务消歧使用 `--task-route`。

## 先解析，再生成

下面的路径用占位符表示。将 `<REPO_ROOT>`、`<RULES_ROOT>` 和 `<PROJECT_DIR>` 替换成绝对路径。只做路由发现时，`REPO_ROOT` 可以指向本精简版目录，因为它包含索引所需的 HTML 包和 Token；`RULES_ROOT` 也指向本精简版目录。本 Skill 的 HTML 页面生成同样把 REPO_ROOT 和 RULES_ROOT 都设为精简版目录。Pixso Bridge、Gallery 等外部服务才可能需要单独的完整仓库。

先读工作流路由和生成 Context Packet：

```bash
node "<RULES_ROOT>/scripts/resolve-workflow-route.mjs" \
  --route new-page --repo "<REPO_ROOT>" \
  --receipt-out "<PROJECT_DIR>/.text-to-ui/route-read-receipt.json"

node "<RULES_ROOT>/scripts/resolve-context.mjs" \
  --task "邮件工作台" --workflow-route new-page \
  --framework html --mode fast-preview --discover \
  --repo "<REPO_ROOT>" --skill-root "<RULES_ROOT>" \
  --out "<PROJECT_DIR>/.text-to-ui/context-discovery.json" \
  --brief-out "<PROJECT_DIR>/.text-to-ui/page-brief.json"
```

先读取 page-brief.json v2 的导航，再用 query-resources.mjs 按阶段取得所需资料；不展开完整 Context Packet 的机器材料列表。确认业务需求和 Blueprint 后，再准备 `page-blueprint.json`、`page-content-recipes.json`、`page-bindings.json` 与 `styles/page-composition.css`。最后由一键入口完成验证和生成：

```bash
node "<RULES_ROOT>/scripts/generate-compliant-page.mjs" \
  --project "<PROJECT_DIR>" --repo "<REPO_ROOT>" --skill-root "<RULES_ROOT>" \
  --framework html --task "邮件工作台" --route new-page \
  --blueprint "<PROJECT_DIR>/page-blueprint.json" \
  --content-recipes "<PROJECT_DIR>/page-content-recipes.json" \
  --bindings "<PROJECT_DIR>/page-bindings.json" \
  --page-css "<PROJECT_DIR>/styles/page-composition.css"
```

该入口的 `--mode` 接受 `fast-preview` 或 `release-validation`；为兼容旧调用，`release` 也映射为 `release-validation`。初次路由阶段使用 `--discover`，不要把发现阶段的 Context Packet 当成已确认的生成输入。

## 可复制给其他 AI 的任务卡

```text
请读取 text-to-ui-html/SKILL.md；若已安装，再调用 $text-to-ui-html。只生成页面引用独立组件的动态 HTML 项目。index.html 只作空宿主。
操作目标：<新建页面 / 精确修改 / 导入 Pixso / 组件库维护 / 导入排错 / Skill 维护>
业务任务：<用户要完成什么工作>
现有页面或项目：<绝对路径或明确说明新项目>
REPO_ROOT：<本精简版目录，与 RULES_ROOT 相同>
RULES_ROOT：<text-to-ui-html 目录绝对路径>
PROJECT_DIR：<本次页面项目绝对路径>
组件需求：<可留空；如需指定，请写准确组件 ID>
读取范围：先 discover 并输出 --brief-out；模型读短摘要和必要的单个契约。
产物职责：模型写 Blueprint/配方/绑定和 styles/page-composition.css；脚本准备 components/、styles/index.css、styles/base.css 以及页面和挂载模块。
样式规则：main.js 只导入统一 styles/index.css；页面 CSS 不写 @import、不改组件内部和 Pattern 几何。
确认阶段：需求明确后生成动态页面，浏览器检查后再按需进入 Pixso 路由。
请先输出选中的 workflow route、task route、Pattern 和精确契约路径；遇到歧义或缺失时先报告候选，不要猜测。
```
