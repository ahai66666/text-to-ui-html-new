# 本地预览与导出

生成后双击项目根目录的 `index.html`，即可查看并操作网页。HTML 加载 `.text-to-ui/preview/` 中生成的脚本、样式和资源，无需启动服务器、安装依赖或使用 Vite。交付项目时保留整个项目文件夹，包括隐藏的 `.text-to-ui` 目录。

- 生成或修改页面：`node scripts/page.mjs generate --project <项目目录>`。
- 旧项目已有生成源码时，可运行 `node scripts/page.mjs export --project <项目目录>` 补齐根目录预览。
- 只分享一个文件时：`node scripts/page.mjs export --project <项目目录> --format single-file`。
- 需要独立离线目录时：`node scripts/page.mjs export --project <项目目录> --format multi-file`。该目录含自己的 `index.html`、运行脚本、样式、资源和 `src/` 中的执行依赖。可用 `--out out/mail/index.html` 指定位置。

`main.js`、生成模块、组件和业务源码仍保留在原项目里。修改页面输入或业务文件后重新生成，预览会同步更新。生成和重新导出需要 Node.js 20+ 与已安装技能。旧 `out/` 产物保留供已有引用使用。

链接器支持既有静态 ESM 输入。循环依赖、可变导出、动态 import、import.meta 和运行时资源加载会明确报错。链接失败时保留上次成功预览。浏览器本地存储仍受 `file://` 策略影响。

## 正式入口登记

每次 generate/export 的状态和当前正式入口记录在项目 `.text-to-ui/delivery.json`。用 `page.mjs entry --project <目录>` 查询。改动源码或预览文件后，登记状态会提示重新生成。已有手写 HTML 可作为迁移参考。详见 [业务扩展](business-extension.md)。
