# 业务能力缺口与唯一交付入口

## 决策顺序

公开接口能表达 → 使用标准组件；能通过组合表达 → 组合现有组件；需要独立状态/事件/动态内容 → 在现有业务分组声明模块。仍不支持时报告准确缺口、保留进度，不能另写第二套完整 HTML。

源码根 index.html、输出包 index.html 以及输出 src/ 中的源码快照可以并存，它们不是三套业务实现。正式预览以 `.text-to-ui/delivery.json` 登记的唯一入口为准。

## 创建业务模块

项目已有 page-input.json 后：

```sh
node <RULES_ROOT>/scripts/business-module.mjs init --project <PROJECT_DIR> \
  --group <现有业务分组ID> --name ai-assistant \
  --reason "用户需求中无法通过当前消费输入表达的业务编排" \
  --query "实际检索用途"
```

脚本先查询公开目录，保留原有 children 与控件，创建 page-components/ai-assistant/index.js、styles.css，并填写该组 module 声明。查询结果不等于候选已被拒绝；如有被审查拒绝的候选，记录真实原因。已有模块不会被覆盖，也不允许用此入口接管主导航外壳。

只编辑声明的业务模块与私有 CSS。使用 host 范围内的 DOM；保留标准控件身份、调用与样式，不手写按钮、输入框、SVG 或 Pattern。新增标准控件应先在当前组 children 中登记；动态渲染用 api.renderComponent(id, options, context?)，复用同组的消费场景。有多个场景时指明 context。

脚手架不实现业务成功结果，不自动调用 AI、不补造回复。模型必须依据实际需求补充 actions：以现有节点 behavior ID 为键，从其本地点击处理函数执行业务动作；复杂输入/键盘事件在 host 内绑定，返回 cleanup 时移除。

## 本地状态与异步任务

生成器为声明模块准备 createModuleState，不影响无模块页面。它只负责本地状态，不提供后端：

- get()：返回状态副本。
- set(patch 或 updater)：更新模块自身的状态。
- subscribe(listener)：立即提供当前状态，返回取消订阅函数。
- run(job)：执行显式提供的业务任务；job 得到 signal、update、get。状态为 idle/pending/success/error，完成结果由 job 返回。
- cancel()：使当前任务失效并发出取消信号；底层任务需要自行响应 signal。迟到结果不会覆盖后续任务。
- 重试：用明确的同一业务操作再次调用 run，不自动猜测重试内容。
- dispose()：取消当前任务并释放订阅；模块 cleanup 同时移除事件与自身内容。

模块管理槽位内状态与业务内容，不重新挂载整页或改变 Pattern。保留其他模块的选择、草稿和任务状态；跨模块数据/事件关系先写入工作计划的公共约定。

## AI 能力边界

对话列表、引用、结果卡片是界面；取消、重试、阶段和错误是业务状态。真实模型调用、鉴权及流式网络响应是服务能力。离线原型允许实现明确要求的本地演示，但必须标明演示；不能用硬编码回复或 toast 冒充真实推理。

当前离线链接器仍拒绝运行时 fetch 等网络加载。需要真实服务时先明确接入方式，报告当前限制；不能用第二份 HTML 绕过。此更新不开放任意联网，也不重构多屏运行时。

## 唯一正式入口

```sh
node <RULES_ROOT>/scripts/page.mjs generate --project <PROJECT_DIR>
node <RULES_ROOT>/scripts/page.mjs entry --project <PROJECT_DIR>
```

entry 返回正式路径及 ready/building/failed/stale 状态。它核对输出文件与源快照摘要，不代表自动完成业务或视觉验证。generate/export 成功才登记新的正式入口，失败保留此前产物并标记 failed，不能把旧页面当作本次成功。

根目录除源码 index.html 外出现未登记 HTML，会阻止发布并提示迁移。已有手写页面先保留为参考，可放在 `.text-to-ui/reference-pages/`；提取其中业务逻辑到声明模块，再统一生成。不要直接删掉用户已有功能。该保护检查项目根目录，不声称扫描了所有深层业务资产。

单文件导出仍为显式选项；最后一次成功的生成/导出决定唯一正式入口。其他旧输出作为历史保留，不自动删除。分享交付清单指定的完整文件夹，而不是让用户在多个“最终版”之间猜选。

## 最小页面优先验证高风险能力

最小页面不仅显示骨架，还应先跑通最复杂或最不确定的一条用户要求的交互，例如本地取消与重试、结果更新或跨模块选择。先确认扩展方式可行，再补其他区域。失败修正当前模块，恢复时仅查询相关接口，避免重写完整页面。
