# Quasi Atlas G1 — 从本地到 GitHub、CI/CD、Vercel、Cloudflare

版本：0.3.0（2026-10-24）。目标站点：https://math.edunest.app/

## 一、生产流转关系

Local Mac / OWL LAB → git feature branch → GitHub 私有仓库 tubban1/quasi-atlas → PR → GitHub Actions scientific-gate + browser-gate（目前 GitHub 账户账单限制导致 runner 无法启动）→ main push → Vercel Git 自动检测 → 按 vercel.json 执行 npm ci、npm test、npm run build → 成功后 Vercel 发布到 quasi-atlas-math → Cloudflare 固定 DNS → math.edunest.app。Cloudflare 不参与每次发布。

当前生效的部署门禁是 Vercel 内置构建中的 44 项 Node 数学/教学测试。GitHub Actions 的浏览器门禁已经定义，但 GitHub 账户返回付款/额度限制，尚无法执行；因此尚不能声称浏览器 Gate 已在 GitHub CI 真正生效。若希望强制 PR checks，须先解除账户限制并启用 main 分支保护。不要把 Vercel 和 Cloudflare 理解成两个网站部署；Cloudflare 此处只管 DNS。

## 二、开发环境与唯一发布目标

- 本地：/Users/wahaha/Documents/Me/Project/cursor/quasi-atlas
- GitHub：tubban1/quasi-atlas（私有）
- Node：22+
- Vercel Team：tubbans-projects-c58b36e6
- Vercel Project：quasi-atlas-math
- Vercel Org ID：team_QN3H1ExnSFCPFiJPh0qLyUJ0
- Vercel Project ID：prj_y7LMvxhTmqEmzlOnqLA2Ro71TfVb
- Cloudflare zone：edunest.app
- DNS：math.edunest.app 的 CNAME → 4415beab2a9c561a.vercel-dns-017.com，DNS only
- 正式站：https://math.edunest.app/

绝不可覆盖 edunest2025、edunest-radar 或改根域名 nameserver。Cloudflare CNAME 不应在每次发布时修改。

## 三、实际开发命令

在 Terminal 中依次执行（每行一条）：

    cd /Users/wahaha/Documents/Me/Project/cursor/quasi-atlas
    git switch main
    git pull --ff-only
    git switch -c feat/your-feature
    npm ci
    npm test
    npm run build
    npm run start

打开浏览器 http://127.0.0.1:5188/ ，在另一个 Terminal 窗口执行：

    npm run test:browser
    node scripts/smoke.mjs

随后提交并发起 PR：

    git status --short
    git add -A
    git commit -m "feat: feature description"
    git push -u origin feat/your-feature
    gh pr create --fill

计划要求合并前 scientific-gate 与 browser-gate 通过；但当前 GitHub Actions 因账户账单/支出上限阻塞，实际尚无法启用强制 PR 门禁。当前有效自动发布路线是 Vercel Git 集成：合并 main 后自动运行 vercel.json 内的测试/构建；两者成功才替换生产部署。

## 四、GitHub CI/CD 内容

- .github/workflows/ci.yml 是真实工作流，不是示意。
- scientific-gate：Node22、锁文件安装、全部数学/学习内容测试、Vite build、检查敏感服务配置键未进入前端静态包。
- browser-gate：安装 Playwright Chromium；启动本地站，逐一操作 6 张生活数学卡、导出记录，并回归 G0 探索/科研流程。
- deploy-production：这是可选的 Actions CD 备用通道，只有将 GitHub 仓库变量 CD_MODE 切为 actions 并配置 Secrets 后才运行；当前 CD_MODE=git，因此该 Job 跳过，避免同一次提交触发两套生产部署。
- post-deploy：检查 math.edunest.app 页面是否返回 Quasi Atlas。

当前 CD_MODE=git，使用 Vercel 官方 Git 集成，GitHub 不需要存 Vercel Token，且未复制本地 .env 到 GitHub。只有切换至 Actions CD 时，才由用户在 GitHub Secrets 中配置 VERCEL_TOKEN、VERCEL_ORG_ID、VERCEL_PROJECT_ID，并核对 Production environment 权限。CI 不需要 Cloudflare/Neon/AWS/NPM Token。

## 五、Vercel 与 Cloudflare 为什么这样连接

Vercel 负责静态网站构建/托管/HTTPS、生产历史版本和回滚。GitHub Actions 的部署 Job 使用精准项目 ID 发到 quasi-atlas-math。Cloudflare 只管理 math.edunest.app 的 CNAME，指向 Vercel 提供的专用域名。

因此后续更新的流程是“推送源码 → 自动测试 → 新 Vercel deployment → 域名自动指向最新生产版本”，不是每次手动调整 DNS。

查看正式站：

    dig +short math.edunest.app CNAME @1.1.1.1
    curl -I https://math.edunest.app/

## 六、失败、回滚与安全

- 单测/浏览器门禁失败：不能自动发布。查看 GitHub Actions 失败日志；不要为了变绿而放宽数学阈值。
- 生产部署失败：核对 GitHub Secrets 和 Vercel projectName/projectId/orgId；不要改其他项目。
- DNS 不生效：分别向 1.1.1.1 / 8.8.8.8 查询，注意递归 DNS 缓存；不随意修改 Zone nameservers。
- 线上新版本故障：从 Vercel Deployments 选择前一个已知正常版本回滚；或 GitHub revert commit 经同一套 CI/CD 再发布。无需变更 Cloudflare 记录。
- 本地 .env、.env.local 和 .vercel 目录在 .gitignore 中忽略，发布时 .vercelignore 排除本地配置和机密文件。
- 本项目为 local-first 静态教育站；没有理由上传用户实验到 Neon。

## 七、G1 使用与质量范围

六个教育入口：山路等高线、积水连通、合成等温线、1D 拍频、摩尔纹、模拟 Wi-Fi 场。

用户路径：先猜一猜 → 亲手改变条件 → 逐层查看数学模型 → 看一个反例/局限 → 进入研究或下载学习 JSON。教学模型属于 E0，二维有限网格的科研测量属于 E1。拍频是 1D 信号，绝不冒充 2D 场。

全部使用合成教学数据；G1 教师和真实用户理解测评、第三方实际气象/地形数据溯源依然待完成，不能宣称教育成效已由独立实验证实。当前 G1 是工程版 Beta。

## 八、维护与审计

- 每次线上事故须记下 Git commit、GitHub Actions run、Vercel Deployment ID、域名 HTTP/证书状态。
- 对算法、证据等级、生活类比的更新必须先加反例和测试，再改 UI 宣传。
- 实验科学结论的稳定性不是因为部署成功就变得可信；E2/E3/E4 仍受科研验证协议门禁限制。
- 更高级科研内容见 docs/SCIENTIFIC_VALIDATION_PROTOCOL.md 和 docs/RESEARCH_GRADE_MASTER_PLAN.md。
