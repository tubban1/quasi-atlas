# Quasi Atlas · 研究级规划文档入口

**制定日期：2026-10-23 | 原基线 0.2；截至 2026-10-24，G0/G1 工程已实施，G2 Notebook Beta 的 Mac↔Linux 同引擎固定样例复现已通过，Windows 真实设备也完成了同引擎固定样例验收；G3.1 有限顶点网格 H0 与第三方 GUDHI 3.11.0 已完成 30 组/1,048 条区间对照；G3.2 的 H1 有限网格 480 个阈值已与 GUDHI 验证；G4 精确有理数受限原型、G5 36 组准周期实验和 G6 本地自测/发布门禁已落地。但 H1 持久配对、TTK、G4 认证、论文复现、真人教育评估及外部审稿均未放行。**

G3–G6 目前各阶段真实工程范围与剩余阻塞见 [G3_G6_ENGINEERING_DELIVERY.md](G3_G6_ENGINEERING_DELIVERY.md)。G3.1 已实施的 H0/GUDHI 独立对照、固定基准与限制见 [G3_H0_INDEPENDENT_REFERENCE.md](G3_H0_INDEPENDENT_REFERENCE.md)。G2 当前实施、复算协议与限制见 [G2_NOTEBOOK_REPLAY.md](G2_NOTEBOOK_REPLAY.md)，跨环境验证命令与证据要求见 [G2_CROSS_RUNTIME_QUALIFICATION.md](G2_CROSS_RUNTIME_QUALIFICATION.md)。工作台渐进式信息架构见 [STUDIO_FOCUS_INFORMATION_ARCHITECTURE.md](STUDIO_FOCUS_INFORMATION_ARCHITECTURE.md)，Windows 实机验收见 [G2_WINDOWS_ACCEPTANCE.md](G2_WINDOWS_ACCEPTANCE.md)。全新 UI 信息架构见 [UI_2_INFORMATION_ARCHITECTURE.md](UI_2_INFORMATION_ARCHITECTURE.md)，生产研发流程见 [G1_CICD_RUNBOOK.md](G1_CICD_RUNBOOK.md)，实际 G1 验收与 GitHub Actions 账单阻塞见 [G1_DELIVERY_REPORT.md](G1_DELIVERY_REPORT.md)。

> 一句话：从看见生活中的数学，到亲自提出可证伪猜想，再到可信赖、可复现的科学实验。产品允许人人进入；研究级结论必须遵守严格限定。

## 文档阅读顺序

1. **[RESEARCH_GRADE_MASTER_PLAN.md](RESEARCH_GRADE_MASTER_PLAN.md)** — 项目北极星、用户价值、原创性假设、科学范围、阶段与发布条件。产品负责人先看。
2. **[EVERYDAY_MATH_EXPERIENCE_SPEC.md](EVERYDAY_MATH_EXPERIENCE_SPEC.md)** — 普通人和学生如何通过生活经验理解数学、形成问题与反例；12 张案例卡，首发 6 张及明确教学验收。设计、内容、教育 Agent 先看。
3. **[SCIENTIFIC_VALIDATION_PROTOCOL.md](SCIENTIFIC_VALIDATION_PROTOCOL.md)** — E0–E4 证据分级、验证数值计算、30 组目标数学基准、持续同调、准周期专题、实验包、严谨性门槛。数学、科研 QA Agent 先看。
4. **[TECH_ARCHITECTURE_AND_DELIVERY.md](TECH_ARCHITECTURE_AND_DELIVERY.md)** — 分层架构、建议接口、G0–G6 Sprint backlog、CI/CD、隐私、风险与验收口径。开发 Agent 先看。
5. **[START_AND_RESEARCH.md](START_AND_RESEARCH.md)** — 已实现 0.2 的启动方法与科学边界。避免将规划功能误当成已发布。

## 总路线图 / 发布门禁

~~~text
当前 v0.5.0-beta.2：G0/G1 已实施，G2 Notebook 工程 Beta（Mac、Windows、Linux 固定样例复算通过；独立数学算法待验证）
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

“基于已上线的 G3.1 H0 与经 GUDHI 3.11 验证的 30 组基准，推进 G3.2 H1（明确 2D cubical complex 和非周期边界约定），用独立 GUDHI H1 数据核对洞的出现/消失，并引入 TTK 参考案例和失败差异报告。不要破坏 G2 的 Notebook/1.1 来源指纹，不提升 E1 证据等级；所有 PR 提供退化反例、完整数值差异和 G0–G2 回归。”

## 文件状态

本 Roadmap 为**计划及验收标准**；G0/G1、G2 Notebook Beta、G2 Mac/Windows/Linux 跨平台实验复算已实施，G3.1 顶点网格 H0、30 组 Python BFS/GUDHI 固定基准已实施。G3.2 H1、TTK、连续域严格认证及 G4–G6 尚未完成。涉及研究级数学结论的部分仍须外部专家审核。
