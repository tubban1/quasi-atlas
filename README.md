# Quasi Atlas · 数学秘境（G3–G6 工程 Beta）

**新用户直接上手：** 首页即有一个基于现有数学引擎的可互动群岛模型；拖动水位即可看到实时变化，完成首次操作后才提示继续进入真实画布、点击地图、尝试生活课程。无注册、无数据上传和人为限制；数学统计只针对有限网格。浏览器专项测试：`npm run test:first-play`。

**功能查找与导航：** 顶部「更多 → 全部功能」可按课程、数学场景、实验、日志、科研成果搜索并直达真实功能；详见 [导航与层级设计](docs/FEATURE_NAVIGATION_IA.md)。

**G3–G6 新增进度（非科研正式认证）**：G3 已实现 H1 有限网格逐阈值洞数量并与 GUDHI 480 阈值核对；G4 有限定二次函数的有理数精确验证原型，禁止冒充 E3；G5 36 个可重放的准周期数值实验；G6 六题本机数学理解自测及研究级发布阻塞门禁。**四个 Gate 均未完整放行**，详情见 [G3–G6 交付及待办](docs/G3_G6_ENGINEERING_DELIVERY.md) 与 [研究状态 JSON](fixtures/g6/research-release-status.json)。

**G3.1 已实施**：研究模式新增默认折叠的「区域如何出现、合并？ · H0 实验」，可分别观察高于/低于阈值的有限网格连通分量及主要持久区间，导出 E1 报告。30 组固定样例/480 阈值核对通过，并使用独立第三方 GUDHI 3.11.0 生成 **1,048 条 H0 区间**逐条验证。H1 逐阈值计数已追加，但 H1 持久配对、TTK 和完整 G3 科研认证尚未完成，详见 [G3 H0 验证文档](docs/G3_H0_INDEPENDENT_REFERENCE.md)。

**v0.5.0-beta.2 · G2 已实现的体验**：从探索工作台点击「▤ 发现日志」，记录问题/预测/观察/反例/结论，保存不可变的 E1 快照，比较两次实验并使用相同数学引擎离线复算。支持 Notebook JSON/CSV 导出及安全导入、旧 G0 实验迁移。完整说明见 [G2 Notebook & Replay](docs/G2_NOTEBOOK_REPLAY.md)，[G2 跨运行环境验收](docs/G2_CROSS_RUNTIME_QUALIFICATION.md)列出固定实验包、Mac/Windows/Linux 使用方法和已通过的 Mac↔Vercel Linux 跨环境测试（3 个固定案例），以及通过 Computer MCP 完成的 Windows 真实设备验收。最新工作台采用单主画布和上下文观察/学习/研究面板，见 [工作台信息架构](docs/STUDIO_FOCUS_INFORMATION_ARCHITECTURE.md)。

**0.4.0 全新产品界面**：发现首页（六个生活数学场景）→ 集中式数学探索工作台 → G0–G6 研究路线。保留现有实际计算和 E0/E1 科学分级。见 [UI 2.0 信息架构](docs/UI_2_INFORMATION_ARCHITECTURE.md)。

**G1 工程交付与阻塞情况：** [docs/G1_DELIVERY_REPORT.md](docs/G1_DELIVERY_REPORT.md)。

**G1 六个可互动生活数学主题已加入：** 山路、积水、温度、拍频（1D）、摩尔纹、Wi‑Fi。学习流程为预测、动手、解释、反例、研究/JSON。所有现实类比均标记为合成模型；详见 [docs/G1_CICD_RUNBOOK.md](docs/G1_CICD_RUNBOOK.md)。

**本地质量门禁：** npm run gate（含 G3.1 GUDHI 固定基准）· npm run build · npm run test:g3 · npm run test:g2 · npm run test:ui · npm run test:browser。Vercel Git 自动部署使用 vercel.json：测试通过后发布。GitHub Actions 已配置但账户付费/支出上限目前阻止 runner 执行，详情见运行手册。正式站：https://math.edunest.app/。

**部署域名**：https://math.edunest.app/（独立 Vercel 项目 quasi-atlas-math）

G0 科研地基：12 组解析 golden fixtures、严格模型/实验契约、E1 证据等级、SHA-256 完整性校验、CI 测试。当前不是数学证明软件。详细记录见 [docs/G0_IMPLEMENTATION_REPORT.md](docs/G0_IMPLEMENTATION_REPORT.md)。

> **科研级完整规划已形成**：[规划文档总入口](docs/ROADMAP_INDEX.md) ｜[总路线图](docs/RESEARCH_GRADE_MASTER_PLAN.md) ｜[生活与数学体验](docs/EVERYDAY_MATH_EXPERIENCE_SPEC.md) ｜[科学验证协议](docs/SCIENTIFIC_VALIDATION_PROTOCOL.md) ｜[技术与交付计划](docs/TECH_ARCHITECTURE_AND_DELIVERY.md)。这些是**下一阶段规划**，不代表科研级功能已上线。

**启动和 v0.2 研究功能说明：参见 [docs/START_AND_RESEARCH.md](docs/START_AND_RESEARCH.md)。**

最简单的启动方式：

```bash
npm install
npm run start
```

打开 http://127.0.0.1:5188/ 。本版新增临界点候选扫描、局部聚焦和三档精度稳定性检查（启发式数值指标，不是数学证明）。

一个在本地运行的数学图形探索器：**不只是画公式，而是寻找形状发生变化的瞬间。** 设计对象包括纯好奇的普通用户、数学学生，以及需要可重复数值实验的研究者。

## 快速开始
```sh
cd /Users/wahaha/Documents/Me/Project/cursor/quasi-atlas
npm install
npm run dev
```
打开终端显示的 http://127.0.0.1:5173/ 。另外：`npm test` 运行数学模块测试；`npm run build` 产出 dist/ 静态站点。

## 为什么不是又一个函数计算器
Desmos 已经非常善于直接编辑函数和动画；Mathigon 很擅长数学教学。Quasi Atlas 聚焦不同的入口：**探索景观、通过结构事件主动发现、把观察转成可重现的实验记录**。它像一座可调参数的互动数学博物馆。原创性主张限于体验设计与功能组合，不宣称发明新的数学定理或是最早实现等值线可视化。

## 三条使用路径
- **漫游**：选择地图、拖拽平移、滚轮缩放、改变等值线、观察自动扫描。单击地图可测量一点。
- **理解**：将等值线想成某个高度的海岸；学习闭合曲线与触碰窗口边界的曲线有何区别；实验改变参数时会怎样。
- **研究**：提高分辨率、扩大区域、比较结构事件轨迹，并导出 JSON（曲线坐标、长度、窗口、算法版本）、SVG 线图、PNG。复制链接可恢复参数。

## 数学与实现
- 数学场：准周期余弦叠加、近角度摩尔干涉、六角晶格、高斯岛群、鞍点。
- worker 中逐点采样 Float32Array 和 Marching Squares，使用中心值决策器处理 5/10 checkerboard 模式，按共享网格边 identity 缝合成折线。
- 有限窗口闭合路径数、触及边界路径数、曲线总长度，以及 23 个高度下的离散结构扫描。高度轴标出的事件是**采样差异候选**，不是严格临界值证明。
- Canvas2D + 局部梯度视觉光照渲染，持续改变高度不必重新采样整个场，只抽取新等值线；无需任何云 API 或用户数据上传。
- URL 保存可分享参数；没有账户系统、没有数据库、没有遥测。

## 科学可靠性边界
1. **边界交叉≠无限曲线**；图中没有从有限样本证明 Novikov 型开放轨道。
2. Marching Squares 的有限分辨率可能漏掉小尺度结构，模糊样本点、退化临界点、含噪数据需要特别注意。
3. 相邻高度连通分量变化并不能单独识别 Morse 临界点，也不能替代拓扑持续同调；连续曲线连接关系需进行严格的网格加密与域扩展检查。
4. JSON 导出的 stats 是数值估计，length 的单位来自数学坐标，不是物理单位。数据用于形成假说，不用于证明。
5. 目前是专门设计的探索馆而非任意公式安全解析器，也没有数学专家审阅所有领域内容。

## 项目结构
```
src/math/fields.js    五种数学世界
src/math/contours.js  数值等值线与结构谱
src/worker.js         后台取样计算
src/main.js           交互、数据导出、Canvas 绘制
src/style.css         响应式视觉系统
tests/math.test.js    数值性质测试
```

## 下一阶段（尚未实现）
- 事件跟踪：匹配不同高度下的相同曲线分支，支持连通/合并/分裂的精细因果追踪。
- 多分辨率鲁棒性检测与自适应采样；定量临界点求解与持久同调。
- 可配置频率矩阵/安全表达式编辑、任意类型函数。
- WebGL 3D 高度场（当前版本为 2D 彩色地形与等值线）。

## 数学参考
- Dynnikov, Maltsev & Novikov (2022), *Geometry of quasiperiodic functions on the plane*.
- Maltsev (2026), *On the Novikov Problem for Superposition of Periodic Potentials*.
科学背景有待逐步验证，内置示例不是论文原样复现。
