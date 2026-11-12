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
- interactions: [{id, kind, triggers:[节点ID], outcome, stateChange?, sourceGroup?, targetGroup?, targetSelector?, secondaryPage?}]，非空。详情动作的 triggers 由编译器补齐。stateChange 写实际状态变化，outcome 写用户得到的结果。只声明真实需求；现有 kind 为 component-native、set-selected、filter-collection、toggle-hidden、open-overlay、close-overlay、open-secondary-page。
- states：[{id,kind,appliesTo:[分组]}]，旧项目可省略，省略时只有初始状态。复杂新页或结构调整应声明主流程涉及的状态及分组，例如选中、空结果或失败恢复。
- design：regionPurposes、density 为按窗格 ID 的文本；readingOrder、informationPriority 为窗格或分组 ID 数组；relationships 为 [{from,to,entity,key}]，用于说明共享对象和选择键。复杂新页或结构调整应填写适用的设计信息，旧项目仍可省略。普通页面用已有 group.purpose，不重复填写。见 [页面设计](consumer-page-design.md)。
- businessCss 可选：项目内布局 CSS，只允许 `[data-composition-id="已声明分组ID"]` 根选择器和布局属性，不允许内部控件选择器、视觉属性或 at-rule。更复杂的业务样式放在声明模块的独立 stylesheet 中。

可选 Pattern：A primary-navigation/main-content；B primary-navigation/secondary-list/main-detail；C primary-navigation/tool-workspace；D 以实际 discover 返回窗格为准。运行 `node scripts/discover-page.mjs --task "<任务>"` 查询准确窗格、槽位和允许的 Pattern，无需读取完整上下文。

## 两级导航

布局查询返回 `navigationModes` 时，可用 `"navigationMode": "two-level"` 启用该模式。在 `primary-navigation` 中按槽位分组：

| 组件与 context | Pattern 自动放置 |
| --- | --- |
| `button / page-primary-action` | 顶部可选主操作 |
| `sidebar / secondary-navigation` | 中部滚动，保留同组业务模块 |
| `primary-navigation-item / primary-navigation-shell` | 底部一级入口 |

每组使用一个槽位，组件节点可省略 `slot`。旧输入同时具备一级入口与二级菜单时，编译器自动选择两级导航。显式 `slot` 与导航模式冲突时会报出分组、节点和正确槽位。

## 场景与增量查询

精确组件有多个场景时，不传 context 只返回场景列表，不能直接编译使用。能力别名如 toolbar-icon-action 可自动确定场景；仍有歧义时拒绝。Search 可选 search-standard、search-scoped、search-advanced、search-scoped-advanced；scopeOptions 仅在范围搜索中开放且必须为非空数组，高级入口由场景固定；这四种专用场景用 options 配置搜索功能，不开放未实现的 JSON 插槽覆写。主详情 Titlebar 仅暴露当前分段所需业务参数。

重复组件使用同一接口，不重复读取。describe 支持 --since <状态.json> 和 --write-state <状态.json>，按组件、context、读取深度及源版本判定变化；缓存仅供仍持有旧接口正文的对话/交接复用。已有页面局部修改只查询受影响 ID，使用 generate --revision 继承已生成的结构；布局变化时重新 discover 并用普通 generate。

Accordion/Collapsible 使用 title、detail、expanded、contentId、disabled、state；label 是 title 的兼容别名，title 优先。展开内容用 content 文本插槽，label/description 文本插槽分别对应标题/说明；不同时重复填写同一字段和插槽。需要内部复杂控件时使用声明业务模块。旧 Accordion 的 size、unfocus 不再作为已支持参数，迁移时移除 size，将 unfocus 换成 default。身份标记仍在 button 子节点。

## 节点

组件：`{"id":"save","use":"button","context":"page-primary-action","options":{"label":"保存"},"behavior":"save"}`。

纯内容：`{"id":"description","text":"用户提供的说明","tag":"p"}`。这不是标准控件替代物。

组合：`{"id":"tools","composition":"search-toolbar","children":[组件节点]}`。

组合可选 stack（默认纵向）、section-header（横向）、search-toolbar（横向可换行）、field-group（纵向字段集合）。不得传 className 或任意样式值。节点 slots 使用组件原有公开结构；slot 指 Pattern 槽位，不是组件 slots。系统自动绑定语义要求的槽位。

组件交互需 behavior 指向 interactions；交互原生由组件处理时明确使用 component-native。targetSelector 定位自己声明的内容 ID，例如 `[data-composition-id="status"]`。过滤不会创建数据，打开弹层不会实现后端业务。

## 结构默认值

编译器根据 Pattern 添加全局标题。Pattern B 在未声明最终 Titlebar 时补齐详情标题。业务导航和搜索由页面输入提供。用户仍需给出导航内容及必需槽位的控件（如 C 的 workspace-toolbar、D 的 inspector-toggle）。节点所在 region 必须与槽位 owner 一致。

需要改变整页标题尺寸时填写 `titlebarSize: "medium" | "large" | "xlarge"`；默认由场景提供，small 留给独立 Secondary Page。

Pattern B 的当前对象级操作优先写在顶层，例如 `"detailActions": [{"id":"delete","label":"删除","icon":"action/delete","behavior":"delete-current"}]`。在 interactions 中定义 delete-current；这个触发点无需再填 triggers。用 `find "<用途>" --pattern pattern-b-three-pane --region main-detail --scope detail-action` 查组合。

程序把动作放进右侧 Titlebar，并统一动作样式、保留溢出菜单和系统窗口控件。正文分组内操作仍留在正文。已有显式 Titlebar 插槽可继续使用，不能与 detailActions 重复：

```json
{
  "id": "detail-title",
  "use": "titlebar",
  "context": "main-detail-titlebar",
  "slots": {
    "main-detail-actions": [{"id":"delete","label":"删除","icon":"action/delete","buttonType":"icon"}]
  },
  "actionBehaviors": {"delete":"delete-current"}
}
```

## 业务模块与低层模式

优先用 [业务扩展脚手架](business-extension.md) 创建声明及私有文件；消费输入不足不授权另写完整页面。

缺少组件能力时在分组提供 module 对象：source、stylesheet（项目内路径）、missingCapability、registryQueries（查询数组）、reviewedCandidates（[{logicalName,rejectionReason}]）。模块导出 mount(host,{renderComponent})；控制仍调用标准组件，所有用到的组件应在该组 children 中声明；调用 renderComponent(id, options, context?) 时使用同组场景。组件在该组只有一个场景时可省略 context。模块拥有该组业务内容，不能接管 Pattern。

低层模式用于既有复杂输入：在独立目录维护 page-blueprint.json、page-content-recipes.json、page-bindings.json、styles/page-composition.css，运行 `page.mjs generate --low-level --project <目录> --task <任务>`。不与消费输入模式混用。

## 离线边界

静态 JS import/export、项目内图片和 CSS url 自动打包。默认使用经典脚本；不支持循环模块、可变导出、运行时资源加载、动态 import、import.meta。未支持依赖明确报错。复杂业务模块需遵守这些边界。

修改只编辑 page-input.json 和声明的业务文件，再运行同一 generate。`out/<页面ID>/` 是生成的多文件离线交付包，不直接编辑。修改输入后重新生成；单文件 HTML 是可选导出。
