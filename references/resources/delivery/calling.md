## 页面调用

生成的页面导入本项目组件注册表：

~~~javascript
import { renderHtmlComponent } from "./components/index.js";
const saveButton = renderHtmlComponent("button", {
  label: "保存", variant: "primary", size: "standard", mode: "text"
});
~~~

此例仅展示调用形状。正式页面由严格生成器根据 Blueprint、配方、绑定和行为计划生成。组件内容必须通过支持的参数与插槽传入，几何由所选 Pattern Runtime 管理，页面 CSS 使用 Token。

