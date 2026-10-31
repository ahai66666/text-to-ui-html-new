# 已批准页面参考库

这个目录只保存用户明确认定为合格、且允许后续设计借鉴的页面参考。

普通 Text-to-UI 生成页面、预览、临时产物和历史项目默认都不是参考资料：
它们不会自动登记、不会被索引，也不会在后续页面设计时读取。

只有用户明确说“将此页面加入已批准页面参考库”后，才运行：

```bash
node scripts/register-approved-page-reference.mjs \
  --id <stable-page-id> \
  --title <page-title> \
  --source <approved-file-or-directory> \
  --rationale <why-this-is-a-good-reference> \
  --approved-by user
```

登记脚本会把明确指定的源复制到本目录的 `<id>/artifacts/`，同时写入
`<id>/reference.json` 和本目录 `index.json`。它不会扫描、猜测或自动收录
任何生成输出。

这条隔离规则用于防止尚未审查、质量不稳定的生成结果污染后续设计语言或
成为隐性默认模板。组件、Pattern、Token 与用户批准的参考页是不同层级的
设计资产，不能相互替代。

新页面默认不读取本库。只有生成请求明确指定
`--approved-reference <id>`，Context Packet 才会列出该参考；它用于启发业务
信息架构或页面级组合，不能覆盖 Pattern、组件契约、Token 或行为契约。
