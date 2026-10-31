# 颜色变量统一标记

生成页面与组件预览自动调用 `bindColorReferences`。同一颜色变量使用固定类名，例如 `--color-primary` → `tui-colorref--color-primary`；不同变量即使色值相同也不合并。特殊变量名采用 `tui-colorref-u-` 加完整 UTF-8 十六进制编码，不使用随机数。

## 语义

- 标记表示节点直接声明中**可能引用**的颜色变量，不代表当前计算样式。包括默认/悬停/焦点/选中等受支持状态，以及媒体、支持性、容器条件中的潜在引用；保留原选择器和条件证据。
- 只标直接引用；继承颜色不向子节点扩散，变量定义不触发标记。别名不展开到节点；嵌套回退保留引用与 fallback 字段。
- 原有类名、组件身份和 CSS 保留。标记类名本身不得定义样式，不应用于组件替代或 Pixso 映射。
- 读取 CSSOM 原始声明，包括内联、样式表、递归 @import 和复合属性。不从已计算颜色反推变量名；计算值只辅助判断自定义变量是否颜色。
- 已知颜色名单由 Token 源生成。页面自定义变量按定义、别名及使用位置判断；不确定项记录 `unknown-color-variable`。可以显式补充变量名单，不把阴影间距、RGB 数字通道和透明度当作颜色。

## 使用与证据

生成页面无需手动初始化。`generated-entry.js` 在业务模块挂载后绑定，最终刷新纳入 `#app.__tuiReady`；重新挂载释放旧绑定。准备脚本自动将模块及依赖交付到 `components/_runtime/`，不依赖本机技能路径。normalize-demo 使用同一生成入口，原稿保留不变。

独立业务宿主可使用：

```js
import {bindColorReferences} from '@text-to-ui/components-html/color-references';
const colors = bindColorReferences(root, {colorVariables:['--custom-color']});
colors.refresh();
const evidence = colors.getEvidence();
colors.dispose();
```

生成页面本地注册表同时导出该入口。自动控制器可通过 `#app.__tuiColorReferences` 访问。`refresh()` 同步返回最新证据；`getEvidence()` 返回最近快照；`dispose()` 停止监听、清除工具拥有的标记并释放节点引用，重复调用安全。重复绑定同一 root 自动释放旧控制器，不要在自动生成页面上重复手动绑定。

证据包含 `scope: potential-direct-color-variable-references`、`status: complete | partial`、`variableMap`、`nodeCount`、`references`、`diagnostics`。每条引用包括节点临时 key、元素 id、变量、类名、声明属性/值、来源选择器、投影选择器、条件、伪元素与回退信息。临时 nodeKey 只供当前控制器关联，固定类名才可跨页面复用。

MutationObserver 合并一帧内 DOM、属性、样式文本变化；忽略工具自己的类名变化。按批次重新核对当前 root，以正确处理祖先、兄弟和 :has 关联。CSSOM `insertRule/deleteRule/replaceSync` 直接修改后必须显式 `refresh()`；不修改浏览器原生 API。样式加载完成/失败也会重新核对。

## 明确边界

- 第一版只扫描当前文档普通 DOM。可见 ShadowRoot、iframe、constructed/adopted stylesheets 会报告未覆盖；不跨文档或组件封装读取。
- 受支持状态伪类及状态属性会投影为潜在关联；普通业务条件与 primary/ghost 等变体条件保留。复杂嵌套状态否定、未知选择器报告 partial，不猜测。浏览器在解析时丢弃的非法 CSS 不会出现在 CSSOM，无法逐条恢复原始错误。
- 常用伪元素的引用归属其 DOM 宿主，证据保留伪元素名；`::part` 等封装边界、keyframes 动画引用不进行来源推断，报告未覆盖。
- 跨域 CSSOM 拒绝访问或未加载时报告 `unreadable-stylesheet` 与 partial；交付前应本地化样式后再核对。complete 仅表示当前可见文档范围内没有已识别的缺口，不代表整个网站所有封装上下文均已读取。
- 工具不接管初始化前已经存在的同名类名，保留并报告冲突，避免误删业务类名。不要手写受管前缀。

## 检查与示例

`node scripts/build-color-reference-tokens.mjs --check` 核对颜色 Token 清单；颜色 Token 源变更后先不带 --check 重建，再重新准备页面组件。

执行 `node --test tests/color-references.test.mjs` 验证命名、语法、状态投影与生成依赖；完整自动检查仍使用 `node --test tests/*.test.mjs`。浏览器还须检查标记前后样式/几何及交互，不以静态检查替代。

可运行示例：`apps/color-reference-demo/index.html`。通过本地 HTTP 服务打开，点击示例查看关联类名与原始声明。
