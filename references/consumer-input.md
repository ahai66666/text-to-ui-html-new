# 消费输入 v1

读取本文件一次，再按需 describe 当前组件。查询结构：`consumer.mjs list|find|describe`；使用 `describe toolbar-icon-action --context toolbar-action` 区分有歧义的工具栏按钮。

## 页面输入

page-input.json 顶层：
- schemaVersion: 1；id: 小写短横线标识；title: 用户标题。
- task: 业务任务文字，或 taskRoute: 精确任务 ID。taskRoute 可选，task 必填。
- user、workObject、primaryJob：目标用户、业务对象、主要任务，须来自需求。
- pattern 可选；替代默认布局须提供 patternReason；检查器另填 patternBase。
- entities: [{id, fields:[字段]}]；successCriteria、recoveryPaths: 用户可理解的字符串数组，均非空。
- groups: [{id, region, purpose, composition?, children, entities?}]。region 必须是已选 Pattern 的窗格。
- interactions: [{id, kind, triggers:[节点ID], outcome, sourceGroup?, targetSelector?, secondaryPage?}]，非空。只声明真实需求；现有 kind 为 component-native、set-selected、filter-collection、toggle-hidden、open-overlay、close-overlay、open-secondary-page。
- states 可选：[{id,kind,appliesTo:[分组]}]，省略时只有初始状态。
- businessCss 可选：项目内布局 CSS，只允许 `[data-composition-id="已声明分组ID"]` 根选择器和布局属性，不允许内部控件选择器、视觉属性或 at-rule。更复杂的业务样式放在声明模块的独立 stylesheet 中。

可选 Pattern：A primary-navigation/main-content；B primary-navigation/secondary-list/main-detail；C primary-navigation/tool-workspace；D 以实际 discover 返回窗格为准。运行 `node scripts/discover-page.mjs --task "<任务>"` 查询准确窗格、槽位和允许的 Pattern，无需读取完整上下文。

## 节点

组件：`{"id":"save","use":"button","context":"page-primary-action","options":{"label":"保存"},"behavior":"save"}`。

纯内容：`{"id":"description","text":"用户提供的说明","tag":"p"}`。这不是标准控件替代物。

组合：`{"id":"tools","composition":"search-toolbar","children":[组件节点]}`。

组合可选 stack（默认纵向）、section-header（横向）、search-toolbar（横向可换行）、field-group（纵向字段集合）。不得传 className 或任意样式值。节点 slots 使用组件原有公开结构；slot 指 Pattern 槽位，不是组件 slots。系统自动绑定语义要求的槽位。

组件交互需 behavior 指向 interactions；交互原生由组件处理时明确使用 component-native。targetSelector 定位自己声明的内容 ID，例如 `[data-composition-id="status"]`。过滤不会创建数据，打开弹层不会实现后端业务。

## 结构默认值

编译器根据 Pattern 添加全局标题；Pattern B 另添加详情标题。它不凭空创建业务导航或搜索。用户仍需给出导航内容及必需槽位的控件（如 C 的 workspace-toolbar、D 的 inspector-toggle）。节点所在 region 必须与槽位 owner 一致。

## 业务模块与低层模式

缺少组件能力时在分组提供 module 对象：source、stylesheet（项目内路径）、missingCapability、registryQueries（查询数组）、reviewedCandidates（[{logicalName,rejectionReason}]）。模块导出 mount(host,{renderComponent})；控制仍调用标准组件，所有用到的组件应在该组 children 中声明。模块拥有该组业务内容，不能接管 Pattern。

低层模式用于既有复杂输入：在独立目录维护 page-blueprint.json、page-content-recipes.json、page-bindings.json、styles/page-composition.css，运行 `page.mjs generate --low-level --project <目录> --task <任务>`。不与消费输入模式混用。

## 离线边界

静态 JS import/export、项目内图片和 CSS url 自动打包。默认使用经典脚本；不支持循环模块、可变导出、运行时资源加载、动态 import、import.meta。未支持依赖明确报错。复杂业务模块需遵守这些边界。

修改只编辑 page-input.json 和声明的业务文件，再运行同一 generate。out/*.html 是交付产物，不直接编辑。
