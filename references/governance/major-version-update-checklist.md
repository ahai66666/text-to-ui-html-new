# 精简版核心更新清单

适用于 compact 版本或核心流程、契约、Token、Pattern、路由、生成和验收接口的变更。

1. 记录基线、版本、用户目标及迁移范围。仅修改当前 compact 维护源。
2. 对齐 SKILL、六条操作路由、Task/Pattern、阶段资源及真实命令。保持独立组件、独立样式与动态挂载。
3. 契约变化先重建 registry；Token/Pixso 变化通过各自生成器刷新投影，不手改报告。
4. 重建 resources:build → catalog:build → index:build 并检查。页面验收与库级开发回归分别执行。
5. 验证涉及的行为，分别记录生成、源码、构建、浏览器、Pixso 与视觉对比。成熟度只能凭证据提升。
6. 用 skill:pack 生成使用包或完整包；维护源和历史快照不进入默认使用包。
7. 最后刷新 .delivery-manifest.json。skill:sync 仅同步显式配置的 compact 目标或已存在的 compact 安装，不覆盖完整版。
8. 报告版本、变化、归档去向、体积、迁移、完成及未完成的验收。

Pixso 实际发布为独立任务，Skill 更新不自动发布。
