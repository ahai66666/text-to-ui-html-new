# 多文件离线交付

默认预览入口是 `out/<页面ID>/index.html`。把整个文件夹交给用户，不只给 HTML。

```text
out/<页面ID>/
├── index.html
├── runtime/app.js
├── styles/app.css
├── assets/                 # 有图片、字体等资源时生成
├── src/                    # 实际依赖闭包和页面输入，保留模块化源码
├── preview-manifest.json
└── README.md
```

HTML 只含挂载点，通过外部经典脚本在浏览器内动态生成 Pattern 和控件，不使用 ES module 标签或运行时 fetch。CSS、图片与字体相对路径以各自引用位置重新计算，可整体移动。浏览器预览无需 Node、服务、Vite、npm install。src/ 不是双击入口；生成或重新导出需要 Node.js 20+ 与已安装技能。

- 正常生成：`node scripts/page.mjs generate --project <项目目录>`。
- 只重新导出：`node scripts/page.mjs export --project <项目目录>`。
- 指定入口：`node scripts/page.mjs export --project <项目目录> --out out/mail/index.html`。
- 可选单文件：`node scripts/page.mjs export --project <项目目录> --format single-file --out out/mail.html`。

默认保留源码，不引入 Vite 配置、依赖或启动脚本。原有项目的自定义配置不自动删除。源码工程仍保留 main.js、generated-entry.js、generated-page.js、components/、business/ 和 styles/；输出包 src/ 只复制导出所需依赖及存在的页面输入，不是完整技能安装。

保持链接器现有静态 ESM 边界：循环依赖、可变导出、动态 import、import.meta 和运行时资源加载会明确报错；不偷偷转换业务语义。链接失败保留上次成功的预览包。多文件导出只替换由 preview-manifest.json 标识的自有输出目录。

验证时区分：生成检查、经典脚本执行、资源相对路径与整包移动检查、真实浏览器 file:// 交互、视觉检查。前几项通过不等于后两项通过。浏览器本地存储能力仍受 file:// 策略影响，不能保证跨浏览器或移动目录后保留数据。
