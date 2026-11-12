# 定时任务：每日抓取并翻译 AI Engineer 演讲

建议计划：每天 09:00（cron `0 9 * * *`）。App 要开着；到点时 App 没开，会在下次打开时补跑。
把下面分隔线以下的全部内容，复制到 Claude 桌面 App「定时任务」的任务说明里。

---

你负责维护一个 AI Engineer 演讲中文站（GitHub Pages：https://wjh19990923.github.io/talk-notes/ ，仓库 github.com/wjh19990923/talk-notes，main 分支 /docs 目录发布）。项目在本机文件夹 C:\Users\Jinhao\Desktop\网站复刻 。所有命令都在这个文件夹里运行。请全程用中文汇报。

本次任务：抓取新演讲，然后把最多 5 场演讲翻译成自然的中文并发布上线。

## 步骤

1. 先读 `translation-style.md`，这是翻译规范，必须严格遵守：重写而不是对译；短句；先说主干；不用长定语和“的”字串；少用因此、然而、此外和被动句；产品名、人名、模型名保留英文。
2. 运行 `node pipeline.mjs sync`，从 ai.engineer 抓取新演讲并重新解析。如果抓取因为网络失败，记录下来，继续用已有数据往下做。
3. 运行 `node pipeline.mjs queue 5`，列出接下来要翻译的演讲（标 NEW 的是新演讲，会排在最前面）。如果 pending 为 0，直接跳到第 6 步。
4. 对列出的每一场演讲，依次执行：
   a. `node pipeline.mjs dump <key>`，生成 `data/work/<key>.src.txt`。每行格式是 `路径|英文`，换行用字面的 `\n` 表示。
   b. 读这个文件，把每一行翻成中文，写到 `data/work/<key>.zh.txt`。每行格式是 `路径|中文`，路径必须原样保留，一行对应一条，换行同样写成字面的 `\n`。规则：
      - Markdown 链接，包括时间戳链接 `[3:00](https://www.youtube.com/...)`，链接文字和 URL 一个字符都不能改，数量和顺序也要保持；反引号 `代码` 原样保留；粗体 `**…**` 保留。
      - 以 `- ` 开头的列表项和图表说明（例如“A → B（动词）”）保持原来的结构，只翻译文字。
      - `title`、`article.title`、`slides.N.title` 这类标题要简洁自然，不要逐词直译。
      - 写完后按 translation-style.md 第二节的清单自查一遍，改掉翻译腔。
   c. `node pipeline.mjs apply <key>`。如果输出里有 rejected 或 stillMissing 大于 0，按提示修正对应的行，再 apply 一次，直到 rejected=0、stillMissing=0。（如果 key 以 `-` 开头，命令照常写在 apply 后面即可。）
   d. 每完成一场，简短记下：演讲 key、条数、是否通过。
5. 不要修改 pipeline.mjs、gen.mjs、parse.mjs、site-src/ 或任何配置文件；只能写 data/work/ 和 data/zh/ 下的文件。
6. 运行 `node pipeline.mjs publish "Daily: translate N talks"`（N 换成本次完成的场数）。它会生成网站、提交 data/zh 和 docs，并推送到 GitHub。如果推送失败（比如网络问题或远程有新提交），先 `git pull --rebase origin main` 再推一次；还是失败就停下，汇报错误，不要强推。
7. 最后汇报：抓到了几场新演讲；本次翻译了哪几场（附中文标题）；是否推送成功；剩余待翻译的演讲数（queue 输出里的 pending 数）。

## 注意
- 如果中途额度不够或被打断，已经 apply 的内容会留在 data/zh 里，下次运行时会一起发布，不用担心。
- 不要使用、也不要读取任何 API key 或 token 文件。
- 不要翻译逐字稿（transcript），这次只做 pipeline 默认范围的内容。
