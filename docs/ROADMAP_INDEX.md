# Quasi Atlas · 研究级规划文档入口

**制定日期：2026-10-23 | 原基线 0.2；截至 2026-10-24，G0 已实施、G1 首批六张合成教学卡已实施，教育实证及真实开放数据仍待验收。**

生产研发流程见 [G1_CICD_RUNBOOK.md](G1_CICD_RUNBOOK.md)，实际 G1 验收与 GitHub Actions 账单阻塞见 [G1_DELIVERY_REPORT.md](G1_DELIVERY_REPORT.md)。

> 一句话：从看见生活中的数学，到亲自提出可证伪猜想，再到可信赖、可复现的科学实验。产品允许人人进入；研究级结论必须遵守严格限定。

## 文档阅读顺序

1. **[RESEARCH_GRADE_MASTER_PLAN.md](RESEARCH_GRADE_MASTER_PLAN.md)** — 项目北极星、用户价值、原创性假设、科学范围、阶段与发布条件。产品负责人先看。
2. **[EVERYDAY_MATH_EXPERIENCE_SPEC.md](EVERYDAY_MATH_EXPERIENCE_SPEC.md)** — 普通人和学生如何通过生活经验理解数学、形成问题与反例；12 张案例卡，首发 6 张及明确教学验收。设计、内容、教育 Agent 先看。
3. **[SCIENTIFIC_VALIDATION_PROTOCOL.md](SCIENTIFIC_VALIDATION_PROTOCOL.md)** — E0–E4 证据分级、验证数值计算、30 组目标数学基准、持续同调、准周期专题、实验包、严谨性门槛。数学、科研 QA Agent 先看。
4. **[TECH_ARCHITECTURE_AND_DELIVERY.md](TECH_ARCHITECTURE_AND_DELIVERY.md)** — 分层架构、建议接口、G0–G6 Sprint backlog、CI/CD、隐私、风险与验收口径。开发 Agent 先看。
5. **[START_AND_RESEARCH.md](START_AND_RESEARCH.md)** — 已实现 0.2 的启动方法与科学边界。避免将规划功能误当成已发布。

## 总路线图 / 发布门禁

~~~text
当前 0.2：启发式数值探索
     |
G0 科学地基 ── 定义、12 golden fixtures、可靠数据/证据 schema
     |
G1 生活入口 ── 山路/积水/等温线/拍频/摩尔纹/Wi-Fi，预测与反例
     |
G2 复现实验 ── Notebook + 可分享/可离线重算实验包
     |
G3 拓扑研究 ── H0/H1 / persistence、TTK-GUDHI 交叉检验
     |
G4 限定类数值认证 ── interval bounds + certificate + UNKNOWN
     |
G5 准周期专题 ── 文献模型精确复现实验，长程观测不冒称证明
     |
G6 外部审阅 ── 数学/教育专家反馈、无障碍、发行门禁
     |
Research Edition 1.0（目标：受限领域内可信、可重复）
~~~

## 必须一直保持的五条规则

1. **可视化 ≠ 证明**：有限窗口边界穿越不证明无限无界轨迹。
2. **科研级不是功能数量**：可复现性、负例、独立求解与误差边界优先。
3. **同场景，不同深度**：普通人、学生、研究者共享真实数学对象。
4. **现实类比有边界**：模拟数据/公开真实数据/用户数据必须标明。
5. **先把 1 个领域做可信，再扩展**：二维标量场拓扑优先，准周期为专研专题。

## 最值得优先开发的一件事

**先做第一条端到端路径：从“山路等高线”或“积水连通”出发，用户提出一个预测 → 模型产生结果 → 数值检查是否可靠 → 生成附证据级别的实验包。**

此闭环跑通后，再批量扩展生活卡，避免只有一堆漂亮演示。

## 下一次委派给 Agent 的明确任务

“阅读 docs/ROADMAP_INDEX.md 和四份主规划，以 G0 为唯一目标。保留现有 0.2 的兼容性，先补 12 个数学解析 golden fixtures、实验模型/证据字段与失败状态，建立 CI 并验证，不做 G1–G6、不部署、不擅自升级科研宣传口径。所有 PR 提供测试、回归、解析反例和验收报告。”

## 文件状态

目前完成的是**设计规划文档**，不是未来 G0–G6 代码实现。文档需要在 G0 实际开始时转化为 issue 与 acceptance fixtures；涉及研究级数学判断的部分要外部专家审核。
