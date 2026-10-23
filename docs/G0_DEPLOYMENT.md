# Quasi Atlas G0 — 部署记录

部署日期：2026-10-23
- **正式入口**：https://math.edunest.app/
- **Vercel 团队**：tubbans-projects-c58b36e6
- **独立项目**：quasi-atlas-math
- **Vercel 稳定别名**：https://quasi-atlas-math.vercel.app/
- **Cloudflare zone**：edunest.app
- **math 子域 DNS**：CNAME → `4415beab2a9c561a.vercel-dns-017.com`，Proxied = false，TTL 300 秒
- **Cloudflare 记录 ID**：`d41a3608902a6647f4dd2b10f9a15e22`
- **Vercel 检查**：域名项目已验证，CNAME 配置 Valid
- **证书检查**：指定公共边缘地址 TLS/HTTP/2 200；部分本地解析器可能保留之前的 NXDOMAIN 缓存，需要等候缓存过期。
- **架构**：静态 Vite 站点，无后端函数，无 Neon 数据库，也不需要上传任何服务端环境变量。
- **G0 科学状态**：解析 golden 12/12 及退化/临界点，实验 schema E1，结果哈希；非认证数学证明。

## 本地代码和环境隔离
- `.env*`、`.vercel/` 都由 `.gitignore` 忽略；
- `.vercelignore` 排除 `.env*`、docs、tests、scripts、node_modules 和 .git；
- Cloudflare/Vercel/Neon/AWS/NPM 的本地 token 不在浏览器 bundle 中使用或注入；
- 部署由 Vercel CLI 的环境变量会话授权，令牌不写入命令参数；
- 新项目隔离，不修改 edunest2025 与 edunest-radar。

## 验收
- npm test：37 项通过（包含 12 组有限域解析等值线 fixture）；
- npm run build：通过；
- 生产别名浏览器 Playwright：桌面 1440px 与移动 390px PASS；地图、研究、临界点、网格验证、E1 实验 JSON 下载和 SHA-256 校验通过；JS 错误 0。
- SSL：经 Vercel 边缘定向测试可返回 HTTP/2 200；正式域名的端到端默认解析可因递归 DNS 缓存短暂不同。
- 配置有效不意味着不同国家用户的 DNS 缓存同步更新；生产监控应观察域名解析和具体资产响应。

## 后续维护
- 项目文件夹：`/Users/wahaha/Documents/Me/Project/cursor/quasi-atlas`
- 本地构建：`npm ci && npm test && npm run build`
- 直接生产发布：在核对目标 project 与团队后运行 `vercel deploy --prod --scope tubbans-projects-c58b36e6`。Vercel 使用当前授权环境中的 token；不可把 token 放命令参数。
- GitHub Actions 文件已经准备，但当前仓库无 Git remote；如需每次推送自动 CI/CD，需显式创建并关联远端仓库，并配置受保护发布审批。
- 当前项目使用的 `.env` 内容仅限本机，不应该同步到远端平台。
