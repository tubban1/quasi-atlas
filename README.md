# Quasi Atlas · 数学秘境 (G1 Everyday Math beta)

**G1 六个可互动生活数学主题已加入：** 山路、积水、温度、拍频（1D）、摩尔纹、Wi‑Fi。学习流程为预测、动手、解释、反例、研究/JSON。所有现实类比均标记为合成模型；详见 [docs/G1_CICD_RUNBOOK.md](docs/G1_CICD_RUNBOOK.md)。

**本地质量门禁：** npm test · npm run build · npm run test:browser。Vercel Git 自动部署使用 vercel.json：测试通过后发布。GitHub Actions 已配置但账户付费/支出上限目前阻止 runner 执行，详情见运行手册。正式站：https://math.edunest.app/。

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
