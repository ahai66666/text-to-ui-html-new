# text-to-ui-html-new 路由与接口修复

日期：2026-11-03。本次只维护独立新技能，旧 text-to-ui-html 未修改；未提交或发布 GitHub。

## 完成内容

- 保留 Workflow → Task → Pattern 三层，默认 discover 仅返回操作、业务路由、默认及允许 Pattern、窗格和必要槽位；完整上下文保留给内部脚本。
- Accordion/Collapsible 契约、目录及实现对齐。title、label兼容别名、展开、禁用及状态实际生效，身份仍在 button。文本 label/content/description 插槽已贯穿生成链路，内容按文本转义。
- 普通 Button/Search/Titlebar 缺少必要 context 时不能绕过场景约束；精确能力别名自动确定场景。
- 新增 Search 四种用途，按需收窄参数及插槽；主详情 Titlebar 限制到本分段的业务接口。
- describe 对重复组件去重，支持 --since / --write-state；完整契约及实际传递源码依赖变化均触发重新输出。状态文件只在当前对话/交接保留已读正文时复用。

## 实测输出体积

| 项目 | 字节数 |
| --- | ---: |
| Collapsible简短接口 | 347 |
| 邮箱简短路由 | 1500 |
| 同任务底层完整上下文 | 137185 |
| 首次读取两个组件 | 703 |
| 同版本重复读取 | 73 |

这里只是工具输出字节数，不能直接当作 Token 节省或模型质量测评。

## 验证

23项Node测试通过，包括五类离线打包回归、四种Pattern实际生成、组件参数、语义约束、增量接口与文本插槽完整生成。契约聚合、资料、目录和导航索引检查通过。独立生成的验证页在本地HTTP浏览器检查：标题/文本插槽显示正确、Accordion展开/收起、Collapsible展开/收起、禁用按钮、按钮身份、ARIA与面板显隐一致，控制台error为空。此次不是四种Pattern的逐像素或file://浏览器验收。

本地安装已备份并从新构建的消费包更新；451个打包文件逐项SHA-256回读一致，安装后的简短接口与允许Pattern输出检查通过。安装记录见 outputs/context-fix-install-report.json。

## 使用与迁移

```sh
node scripts/discover-page.mjs --task 邮箱工作台
node scripts/consumer.mjs describe search-scoped
node scripts/consumer.mjs describe accordion collapsible --write-state <PROJECT_DIR>/.text-to-ui/query-state.json
node scripts/consumer.mjs describe accordion collapsible --since <PROJECT_DIR>/.text-to-ui/query-state.json --write-state <PROJECT_DIR>/.text-to-ui/query-state.json
```

旧Accordion调用：label仍兼容，推荐title；size没有真实能力已移除，state=unfocus迁移为default。重复实例请提供各自唯一的contentId。新建页面直接使用本地更新技能；已有项目中的组件副本与已发布页面不会自动升级。此次没有全49组件的实现一致性审计结论。
