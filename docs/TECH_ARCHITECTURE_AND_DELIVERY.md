# Quasi Atlas — 科研级技术架构、工程任务与验收路线

**Architecture / Delivery Plan 1.0｜2026-10-23｜规划状态，不代表已实现。**

## 1. 架构决策：避免第二次推翻

从当前 v0.2 Vite + Vanilla JS + Canvas2D + Web Worker 升级，但**不急着换整个技术栈**。

**核心边界：**
1. Formula & Data Layer：数学函数/栅格数据的定义、来源、单位、解析/导数，完全独立于 UI；
2. Numerical Engine：计算、采样、求解、测量、误差/认证；可 headless 使用；
3. Evidence Engine：证据等级、模型假设/失败状态、复现实验包、不同实现结果比对；
4. Learning Content：日常卡片、课程与生活模型的解释，独立内容资产及科学审阅状态；
5. Presentation UI：视觉、美术、声音、动画和交互视图，不能篡改 scientific result；
6. Optional Collaboration：分享和协作在后期另起，可关闭；本地使用不需要云后端。

### 高层系统图

~~~text
            Life Lens       Living Atlas       Evidence Lens / Notebook
                \                |                       /
                 +---------- Application UI -------------+
                               |
                     State / Experiment Session
                               |
                         Worker Orchestrator
                  /                |                \
          Field Evaluator    Topology Kernel      Verification
          AST / raster       contour/H0/H1        multi-grid/interval
                  \                |                /
                   +----------- Result ------------------+
                               |
                      Evidence Classification
                               |
                  Versioned Experiment Bundle
                       /               \
                   Local FS         Headless CLI
                                      |
                              Independent oracle
                           (TTK / GUDHI / other)
~~~

所有科研结论有唯一的证据来源（solver results），UI 只负责展示；没有两套“各自算一遍”却显示为同一个结果的隐藏算法。

## 2. 为什么不应直接把全部代码改成 Three.js 或重写 Rust

- Three.js/WebGL 可以承担漂亮的 3D 高度场和镜头，但**它不是数值算法正确性的证据**；
- 初期保留 Canvas2D 渲染，逐步增加 WebGL 作为可切换视图；避免一次迁移破坏现有互动质量；
- Rust/WASM 在独立、可对照测试的高性能部分值得考虑，前提是确定计算瓶颈与内存模型；
- 真正的科学认证可能需要 CPU 上支持 interval arithmetic/独立 verifier 的后端或本地计算环境；
- 研究团队采用 Python/Jupyter 的现实很重要；应提供 Python-readable 导出与独立 CLI，而非要求所有研究者使用 Three.js。

## 3. 计划目录结构（渐进式迁移，非当前目录）

~~~text
quasi-atlas/
  apps/
    web/                       Vite / TypeScript，响应式交互入口
    research-cli/              headless 批量计算与回放命令
    research-bridge/           可选 Python 离线适配器（无默认云服务）
  packages/
    math-model/                AST、参数、域、坐标、单位、数据输入
    math-numerics/             网格、自适应采样、插值、临界点
    math-topology/             contour tree / persistence adapter
    math-verification/         稳定性、误差界、验证器适配
    evidence-schema/           分级证据与 ExperimentBundle schema
    content-engine/            案例、问题、反例、概念知识图
    ui-design/                 主题、组件、动效与可访问交互
  content/
    everyday/                  生活卡：模型、简化假设、数据、验证题
    research/                  论文复现实验清单
  benchmarks/
    golden/                    解析真值与边界测试 JSON
    real-data/                 许可清楚的样例数据
    regression/                发现的数值反例与最小复现
  docs/
    RESEARCH_GRADE_MASTER_PLAN.md
    EVERYDAY_MATH_EXPERIENCE_SPEC.md
    SCIENTIFIC_VALIDATION_PROTOCOL.md
    TECH_ARCHITECTURE_AND_DELIVERY.md
  tools/
    verify-replay/
    check-license/
    compare-oracles/
  .github/workflows/
    ci.yml
    nightly-numerics.yml
    optional-release.yml
~~~

原则：前 1–2 个迭代先在现有 src/math 下加模块和测试；**仅在开始出现明确包边界时迁移 monorepo**，不是为架构好看而迁移。

## 4. 数据和接口契约

### Core API（拟议）

~~~typescript
type EvidenceLevel = "E0" | "E1" | "E2" | "E3" | "E4";
type ResultState = "complete" | "partial" | "unknown" | "invalid" | "cancelled" | "timeout";

interface Domain2D {
  xmin: number; xmax: number;
  ymin: number; ymax: number;
  coordinateFrame: "cartesian";
  unitX: string; unitY: string;
  boundary: "clipped" | "periodic" | "explicit";
}

interface ScalarField {
  id: string;
  source: "expression" | "preset" | "raster";
  ast?: MathematicalExpressionAST;
  dataHash?: string;
  parameters: Record<string, number>;
  outputUnit: string;
  smoothness: "unknown" | "C0" | "C1" | "C2";
}

interface SolveRequest {
  schemaVersion: string;
  jobId: string;
  model: ScalarField;
  domain: Domain2D;
  level: number;
  tolerances: { absolute?: number; relative?: number };
  requestedEvidence: EvidenceLevel;
  budget: { maxCells: number; maxRuntimeMs: number; maxBytes: number };
}

interface SolveResult {
  jobId: string;
  state: ResultState;
  evidence: EvidenceLevel;
  solver: { id: string; version: string; commit?: string };
  modelHash: string;
  numericalSummary: unknown;
  diagnostics: { warnings: string[]; limitations: string[]; errors: string[] };
  certificate?: unknown;
}
~~~

约束：
- 受支持 AST 严格白名单；禁用 eval / Function / 远程运行脚本；
- 分辨率、域、表达式节点数、输入尺寸有明确限额，防止无限运算；
- jobId + requestEpoch；用户快速拖动时旧 Worker 响应不能覆盖新状态；
- 取消、超时和内存预算有明示状态；
- 文档与测试定义 required/optional 字段，不能靠随机 JSON 兼容；
- “可证明”必须由验证器返回可检查证书，与前端文案无关。

## 5. 把科研数值与视觉交互分开

**渲染层**：
- 使用 GPU 渐变、色彩、轻雾、3D 山体、平滑阴影，创建有高级感的“活的数学世界”；
- 为每个像素设可选 debug probe，显示对应函数数值、插值和误差范围；
- 色盲模式增加纹理/数值/线型编码；永远有公式和单位可展开；
- 交互时可用低精度视觉预览；停止拖动后提交较高精度测量；
- 所有截图水印可选择显示“示意/数值计算/模型名/证据级别”。

**科研层**：
- 数值结果不依赖 CSS、物理像素、缩放设备 DPR、音效或渲染 fps；
- 结果只包含显式世界坐标与研究参数；
- 如果某个高精度运行失败，UI 不可以沿用之前绿色 PASS 的标识；
- 一个研究操作的输入 hash → 一个不可变结果实体，方便审查。

## 6. 工程 Sprint Backlog（可直接开 Issues）

### Sprint G0 — Scientific Foundation（P0）
- QA-001：给当前 v0.2 11 个测试建立 CI、截图回归；对外信息“数值观察 ≠ 证明”不退化。
- CORE-001：将 Field/Domain/Units/Model version 统一成规范化对象；保证默认模型向后兼容。
- CORE-002：实现 canonical experiment state + hash；有浮点编码测试和迁移策略。
- QA-002：写 B01–B12 解析基准；加入 degeneracy、边界相切、未知函数等失败用例。
- QA-003：增加两个模拟器/算法结果的差异输出，而不只检查“测试结果数字相等”。
- UI-001：状态证据等级（E0–E4）UI/导出通用组件；现有结果标记 E1 或更谨慎标签。
**Gate G0：** 12/12 基准、版本化复现、显式失败，不产生虚假研究认证。

### Sprint G1 — Everyday Math（P0）
- EDU-001：生活卡 ContentSchema，包含真假数据来源、教学目标、模型假设和反例。
- EDU-002：山路等高线 + 水坑连通两张端到端卡。
- EDU-003：天气等温线 + 拍频卡（拆成适配的 2D/1D 模型）。
- EDU-004：摩尔纹 + Wi-Fi 示意卡（不误导为真实工程测量）。
- EDU-005：预测交互、找反例、收藏问题、逐层展开公式。
- UX-001：移动端/平板/键盘/Reduce Motion 及色盲对照。
- QA-EDU：进行有样本记录的理解测试，修复产生错误直觉的文案。
**Gate G1：** 六卡每张都能回答“生活中见过什么/用什么数学/什么不适用”；新题迁移评估有明确记录。

### Sprint G2 — Reproducibility（P0）
- EXP-001：ExperimentBundle/1.0 JSON schema 与 migrations；
- EXP-002：Notebook 问题、预测、观察、反例、结论流程；
- EXP-003：同屏对照、永久快照和参数变化后 stale 状态；
- EXP-004：一键导出 JSON/CSV/SVG、离线导入；
- CORE-003：Headless CLI 复算及复现失败分类；
- QA-REPLAY：跨版本复现/导入测试及不可信 JSON 安全测试。
**Gate G2：** 两台机器无账号导入同一实验包，可运行并在声明容差内对照；原始模型未丢失。

### Sprint G3 — Topological Analysis（P0 / P1）
- TOP-001：子水平集/超水平集表示与 H0；
- TOP-002：H1 和 persistence barcodes，标准化边界处理；
- TOP-003：与 GUDHI cubical complex 的独立输出比较；
- TOP-004：与 TTK 临界点/merge tree 的参考案例差异回归；
- TOP-005：多分辨率曲线分支匹配、事件定位与不确定性；
- TOP-006：关键事件显示“前/中/后”三个画面并附证据记录。
**Gate G3：** 30 个 golden fixtures，临界高度附近退化测试，独立参考工具对照有清楚的误差/差异记录。

### Sprint G4 — Validated Numerics（高风险，P0 科研级放行）
- VER-001：选择具体可认证的解析函数语法及区间算术库，许可证/正确性审核；
- VER-002：支持安全的区间求值，处理 outward rounding、溢出和 NaN；
- VER-003：实现受限类驻点的存在/唯一/排除证书验证；
- VER-004：独立 verifier 读取证书，故意损坏的证书不得通过；
- VER-005：UNKNOWN/TIMEOUT 端到端 UX 与报告；
- QA-CERT：逆向构造数值退化、极端范围等负例。
**Gate G4：** 没有 E3 假阳性；认证范围在说明书中精确定义，经过外部数学/数值分析专家审阅。

### Sprint G5 — Quasiperiodic Research（P1）
- RES-001：规范频率矩阵/相位的准周期场模型；
- RES-002：角度扫描/长程区域实验，区分周期近似；
- RES-003：针对已发表结果实现至少一个严格受限族论文复现；
- RES-004：窗口扩张曲线统计、边界效应、数值不确定度；
- RES-005：CLI 参数 sweep、持久存储、可重放 manifest；
- QA-PAPER：由数学专家审核“文献结果适用假设”和可重复性。
**Gate G5：** 论文复现过程透明、无泛化过度，结果可复算，失败结果保留。

### Sprint G6 — Independent Review and Launch（P1）
- ACCESS-001：WCAG 关键流程审查、适龄内容说明；
- EDU-REVIEW：至少两位教师/教育研究背景人员对概念与语言审查；
- SCI-REVIEW：至少一位数学/数值分析研究者核对论断和风险；
- DOC-001：版本化学习材料、算法透明度说明、论文引用；
- OPEN-001：开源许可、依赖审计、CI、语义化版本与贡献指南；
- RELEASE-001：内部 beta → 发布候选 → 公开发行，每步均有阻塞规则。
**Gate G6：** 外部复核反馈闭环，稳定性和研究边界文案在 README 与 UI 一致。

## 7. 独立 QA 和开发 Agent 分工

**资源现实**：只有一人负责产品方向与集成，Agent 可承担实现与测试，但“同一个 Agent 写代码并宣称科学正确”不算独立验证。

- Agent A（Math Engineer）：模型/数值内核/解析测试，不写 UX 认证结论；
- Agent B（Scientific QA）：独立实现 fixtures / fuzz / differential tests，必须能否决 A；
- Agent C（UX/Content）：生活案例、预测—反例交互、中文解释及可访问；
- Agent D（UI Engineer）：Canvas/WebGL 性能和组件设计，不修改证据字段含义；
- 人类数学顾问（必要）：G3/G4/G5 的严格数学与论文适用假设；
- 项目 owner：决定什么功能值得做、审阅报告和批准公开。

每个 PR 应包含：问题、变更影响范围、模型语义、测试/截图、失败用例、无过度证明宣称的校验。数学真值不允许由实现 Agent 单独签字。

## 8. CI/CD 与科学发布门禁

**Pull Request CI：**
- lint/typecheck、unit/property tests；
- golden benchmarks，关键跨实现对照；
- Linux/macOS（必要时 Windows）复现测试；
- Math content schema 和科研状态文案校验；
- 浏览器 desktop/mobile smoke，关键交互截图比较；
- 禁止危险代码解析、隐私与许可扫描。

**夜间/周期性（未来计划）：**
- 长时间参数扫描与随机压力测试；
- TTK/GUDHI 的 headless 基线对照；
- 浮点/窗口扩张和 h-refinement 变更检测；
- 性能基线、内存增长、长程数值批量报告。

**部署策略：**
- Preview/Staging 仅供用户测试/科学审核；正式 production 上线由 owner 批准；
- 科研结果每份附代码 commit 和 schema 版本；升级不改变历史实验记录；
- 失败必须留在 CI 报告中，不能自动“用更宽松阈值让它通过”；
- 若科研 gate 失败，游客模式可继续内测，但不得打出 research-certified 标识。

## 9. 数据、隐私与性能

- 默认不用账户，隐私最小化；用户实验与现实测量默认保存在本地（IndexedDB/文件导出）；
- 分享真实地理数据、照片、传感器记录前需明确用途、可见范围与删除行为；
- 不从上传图片推断用户敏感位置、身份或健康状况；
- 实验的公共链接不嵌入私有设备文件路径或机密数据；
- 性能需实现 Worker cancel、背压、任务优先级与资源上限；
- 采用 progressive fidelity：交互时预览可粗略，导出报告必须从正式结果生成；
- 任何耗时超过门槛的研究任务要显示进度与停止按钮，而非让浏览器无响应。

## 10. 版本和宣传口径（强制）

- **0.2 当前**：探索与启发式数值检查；
- **0.3–0.5（计划）**：生活课程及可重现实验包；
- **0.6–0.8（计划）**：成熟的拓扑分析和独立数值对照；
- **0.9 RC（计划）**：对受限类实现 validated numerics，并完成研究顾问审查；
- **Research Edition 1.0（目标）**：限定领域的可重复科研工作流＋审过的学习体验。证据等级最高可以到 E3（仅在确有可独立验证的证书的功能上）；
- **不承诺** E4 自动证明、无限域开放轨道定理、新数学发现或统一适用任何公式。

发布版本号只是规划用名称，实际版本由测试结果决定，不允许因为日期到了就升级评级。

## 11. 可维护性与风险登记

| 风险 | 严重性 | 应对 |
| --- | --- | --- |
| 等值线算法稳定却数值定义错误 | 极高 | 解析 fixtures + TTK/GUDHI oracle + 专家复核 |
| 错把 E2 当 E3 / E4 | 极高 | 单一 evidence engine 与 fail-closed |
| 过度扩展数学领域 | 高 | 先完成二维标量场 gate |
| AI 解释产生貌似合理但错误的生活类比 | 高 | 标注模拟/真实、场景人工审核和反例 |
| 太早重写 Rust/3D/Cloud | 高 | 以性能分析与科学验收决定迁移 |
| 许可混用引发分发问题 | 中 | 每个依赖单独审核，不假定所有库都是 MIT |
| 高成本计算卡死个人电脑 | 高 | Worker/CPU预算、取消与恢复 |
| 用户上传隐私资料造成误用 | 高 | Local-first、不默认上传、数据分级 |

## 12. 近 2 周优先级（允许一个人和 Agent 立即推进）

按严格顺序，不并行引入多种基础概念：

1. **第 1–2 天：** 将 0.2 数学内核基线冻结、整理 12 个 golden fixtures 和失败用例；
2. **第 3–4 天：** 加统一 Field + Domain + Evidence schema 草案与数据迁移测试；
3. **第 5–7 天：** 实现首张“山路等高线”生活卡的从用户问题到研究报告完整闭环；
4. **第 8–10 天：** 做第二张“雨后水坑连通”卡，并用它发现拓扑检查盲点；
5. **第 11–12 天：** 本地 Notebook 初版、实验 JSON 规范、同参数导入回放；
6. **第 13–14 天：** 拉一轮小规模可用性测试和科学正确性检查，按 Gate G0/G1 决定下一迭代。

若 golden fixtures 未通过，停止扩内容、修数学底座；若普通人误解严重，停止扩数值引擎、修体验说明。计划时间为容量估算，不能替代实际测试完成状态。

## 13. 开发完成的定义

**功能 Done**：代码、UI、单位测试、浏览器测试、文档完整。
**Science Done**：包括解析真值、算法限制、可复现证据、独立/专家验收。
**Education Done**：实际用户理解测试、误解与反例、准确解释经过审阅。
**Release Done**：以上三者在预定支持范围内达标，才可以对外标注研究版。

此文档为本地的可执行计划。没有开始实施 G0–G6 各阶段，也没有部署或推送当前仓库。
