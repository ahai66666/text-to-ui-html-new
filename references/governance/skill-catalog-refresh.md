# 精简版资料目录刷新

本目录的 SKILL.md、references/、scripts/、assets/ 和 packages/ 是精简版维护源。生成索引属于派生数据，安装目录和明确配置的交付目录属于镜像。

## 目录规则

skill-catalog-index.json 列出路由、Pattern、组件、Token、动态页面生成、来源校验和交付相关文件及摘要。目录中的路径均相对当前技能根目录。

内置依赖必须存在；只有 apps/ 和 tools/ 下确实属于完整仓库的服务条目可以标记 external-full-repository，缺失状态必须显式记录。它们不阻止本包的 HTML 路由、组件准备与页面生成。

## 刷新命令

~~~bash
pnpm catalog:build
pnpm index:build
pnpm index:check
pnpm catalog:check
~~~

完成修改后刷新 .delivery-manifest.json。先检查调用关系再删除资料。页面模型读取短 brief 和具体路由；维护任务才需要目录清单。可执行行为的验证应覆盖实际改动，无法执行时如实说明。

需要同步时仅同步精简版目标，不能覆盖完整 text-to-ui Skill。Pixso 实际发布属于单独的用户任务，不是资料目录刷新的一部分。
