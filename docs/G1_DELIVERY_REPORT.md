# Quasi Atlas G1 — 工程验收与部署结论

日期：2026-10-24 ｜版本：0.3.0 ｜状态：工程版 G1 Beta

## G1 实际新增

- 六个完整的合成生活数学入口：山路、雨后积水、模拟温度、1D 声波拍频、摩尔纹、模拟 Wi-Fi 场；
- 每个入口有先预测、调整实验变量、数学解释、反例/模型局限和可下载学习记录；
- 一维拍频拥有独立三轨波形 SVG，不冒充二维等值线结果；
- 新的 temperature/wifi 预设具有独立合成单位标签和已测试有限数值场；
- 学习 JSON 标示 E0；G0 二维等值线结果仍为有限网格 E1，不能冒充数学证明。
- 原有数学探索器、研究区、三档网格检查和科研 E1 实验包均保持。

## 自动化代码和环境

- 本地独立仓库：/Users/wahaha/Documents/Me/Project/cursor/quasi-atlas
- GitHub Private：tubban1/quasi-atlas，main
- Vercel Git：已通过 vercel git connect 连接 GitHub 仓库到独立项目 quasi-atlas-math
- Vercel Build Settings：framework=vite，installCommand=npm ci，buildCommand=npm run gate && npm run build，outputDirectory=dist；gate 脚本发现 5 个指定测试文件并要求至少 44 个测试均通过，否则失败。
- Cloudflare：math.edunest.app CNAME 指向 4415beab2a9c561a.vercel-dns-017.com，DNS only
- GitHub repository variable CD_MODE=git；GitHub Actions 的 deploy-production 作为备用模式不启动，避免双重发布。
- 本机 .env、.env.local、.vercel/ 已加入 .gitignore；服务端供应商 Token 不进入浏览器和 Git。

## 工程验收

- npm test：44/44 通过。
- npm run build：通过，Vite 生产构建输出 dist。
- Playwright G1：六项生活教育入口实测、各项预测/参数改变/学习数据 JSON 导出、mobile 390 视窗，浏览器错误 0。
- Playwright G0 回归：二维场、临界点、三档网格、JSON E1 哈希数据导出，浏览器错误 0。
- Vercel Git 自动生产部署：已看到 Vercel 从 GitHub main clone 和 Ready 的实际流水线；代码版本与网站一致。

## 账户级阻塞

**GitHub Actions 当前无法分配 runner**。真实首次运行（GitHub Actions run 40032864452，后续 main run 40033112598）均返回 GitHub 支付/支出限额提示：“The job was not started because recent account payments have failed or your spending limit needs to be increased.” 因此不能声称 GitHub scientific-gate / browser-gate 已在托管 CI 通过。

临时但真实生效的自动质量门禁：Vercel Build Command 在每个 Git 推送的构建中执行 npm test && npm run build。只有两步通过，Vercel 才产生新生产 deployment。浏览器回归目前已经本地以及当前生产别名实际运行过，但**不是 GitHub 自动 runner 执行**。

恢复完整 GitHub CI 的唯一用户侧动作：修复 GitHub Settings → Billing & plans 的 Actions 支付或支出限额，让 runner 能运行；然后验证该仓库 Actions 的两道 job 为成功，再考虑在 main 启用必需 status checks/PR 保护。不能通过把数学门槛放宽来处理账户权限问题。

## 仍待外部验证的 G1 项目

- 首轮真实普通人/学生是否正确理解数学概念，尚无用户学习实验数据；
- 真实公开气象/地形数据和相应 provenance/许可尚未接入；
- 教师/数学研究者的人工教学审查尚未完成；
- 不宣称由这六张卡已经实现正式教育研究科学效果。

完整操作链路、故障恢复和回滚文档：docs/G1_CICD_RUNBOOK.md。
