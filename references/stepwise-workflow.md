# 分步执行与换会话接续

适用：多窗格复杂业务、多个相互依赖模块、预计会反复修正或跨会话的页面。单个明确的文案、参数或局部样式修改直接沿用输入修改和生成，不建立计划。

## 1. 计划先定边界与接口

建立独立项目目录，然后运行：

```sh
node <RULES_ROOT>/scripts/work-plan.mjs init --project <PROJECT_DIR> --modules list,detail
```

唯一进度记录是项目的 `.text-to-ui/work-plan.json`，不是聊天历史。模型填写 goal、decisions、必要缺口 unresolved 和各步 read/write/interfaces/doneWhen。模块名按真实业务替换，不按控件数量机械拆分。计划中不展开所有组件参数。

- decisions：实际 taskRoute、pattern，以及跨模块共享数据/事件约定。例如 selectedMailId 存 ID，由列表写、详情读；不要让不同模块分别猜存 ID 还是整条记录。
- unresolved：影响实施的必要问题；获取答案或明确缩小范围，不用默认业务事实消除问题。
- read：项目内相对路径和阅读范围，例如 `{"path":"需求.md","section":"邮件详情"}`；读取文件不是把整个目录交给模型。
- write：当前可编辑的项目输入/业务文件；不包括受管生成文件。
- interfaces：当前需要的消费接口，例如 `{"id":"button","context":"page-primary-action"}`。
- doneWhen：实际完成条件，按当前任务填写，不能只写“代码写完”。

用户已明确授权的任务不因计划多出重复审批。若环境有计划模式可用于整理，但不依赖特定应用的模式开关。

## 2. 先跑通最小页面

需求与结构明确后，先做真实 Pattern、标题/导航和一条用户要求的主要交互，生成并打开离线入口。缺少的完整业务模块明确标记待完成，不把最小页面当作整页完成。由这个结果确认槽位与消费接口适用，再补其余模块。

不要先写完整个页面，再统一补交互。每个模块完成输入→生成→操作所改路径→局部修正，然后进入下一模块。只处理当前步骤，不反复重读需求、全组件、生成代码或完整日志。

## 3. 更新进度

```sh
node <RULES_ROOT>/scripts/work-plan.mjs complete --project <PROJECT_DIR> --step requirements --note "已确认的范围与结果"
node <RULES_ROOT>/scripts/work-plan.mjs complete --project <PROJECT_DIR> --step structure --note "已确认布局与数据接口"
node <RULES_ROOT>/scripts/work-plan.mjs complete --project <PROJECT_DIR> --step minimal-page --note "实际打开与主要操作结果" --artifact .text-to-ui/offline-preview.json
```

模块步骤名称为 module-<模块名>，也提供当前生成的离线报告。脚本核对产物入口摘要，但 note 是操作者记录，不是自动浏览器验证。未执行操作时不把生成成功写成行为通过。失败时停留当前步骤，将简短问题保留在其 note 或 unresolved 中，不追加长日志。

共享决策变化后，使用 `reopen --step structure --note "变更原因"`，再对照实际文件协调后续模块；重开仅重置进度，不删除代码。

## 4. 接续只读当前步骤

```sh
node <RULES_ROOT>/scripts/work-plan.mjs resume --project <PROJECT_DIR>
```

返回目标、公共约定、简短进度、当前步骤及其新读取的组件接口。新会话仍需读取 SKILL.md 和本流程，不重放之前聊天；不要先读取完整 work-plan.json 或全部页面源码。接口不使用 --since 跳过，因为新会话并未持有旧正文。

当前步骤只需部分页面时：read 填 `{"path":"page-input.json","groups":["list"]}`。resume 提取对应 groups 与相关交互，实体和跨模块约定按需从 decisions/指定文件读取。跨模块交互的目标也应列入当前 read 范围。修改 JSON 时局部编辑，不用分组片段覆盖整份输入；本轮不引入另一套分片输入格式。

在模块边界或开始重复读取、反复重写时保存进度并换会话，不必等待上下文耗尽。resume 默认超过16KB会明确要求缩小当前步骤，不静默截断。它不是 Token 上限保证；系统提示、工具定义及对话历史也占上下文。

最后 integration 串联数据、导航与主要操作，列出剩余问题后交付整个离线文件夹。状态文件不代表所有组件的视觉或业务完整验收。
