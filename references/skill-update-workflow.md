# 维护流程
修改主题小文件或契约维护源；长手册和索引由脚本生成。修改后依次运行 resources:build、catalog:build、index:build，再运行对应 check、pnpm test 和 skill:manifest。skill:pack --out <new.zip> 创建独立运行包。
共享数据只由 HTML 仓发布，Pixso 仓使用 data:sync 同步经过摘要检查的本地快照。不要手改消费者快照。独立运行和真实浏览器/插件验收结果分别记录。
