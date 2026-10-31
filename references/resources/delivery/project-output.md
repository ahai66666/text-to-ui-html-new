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
