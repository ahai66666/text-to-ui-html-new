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
