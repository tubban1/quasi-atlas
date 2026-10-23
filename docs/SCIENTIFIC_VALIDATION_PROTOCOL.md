# Quasi Atlas — 科研计算与数值验证协议

**Science Protocol 1.0｜2026-10-23｜适用：研究级规划，未声称已经实施。**

## 0. 科学诚信契约（最优先执行）

Quasi Atlas 要从“会画图的软件”进化成“可被审查的计算研究工作台”，必须做到：
1. 数学对象必须可明确表达：函数、定义域、单位、参数、边界条件；
2. 任何“发现”必须有状态；没有严格数学依据不得宣称证明；
3. 数值算法必须能检测自身可能不可靠的区域与假设失败；
4. 每个结论都能恢复、审查、反驳；保留未通过、失败和反例的结果；
5. 用户界面可以用生活语言解释，但科学记录不可删去关键限定条件。

### 证据等级（强制出现在 UI、导出与 API）

| Code | 用户可见标签 | 技术含义 | 允许的陈述 | 禁止的陈述 |
| --- | --- | --- | --- | --- |
| E0 | 可视化示意 | 只用于引导直觉、可能非实测 | “这展示了一种可能的形状” | “现实系统就是这样” |
| E1 | 计算观察 | 有明确算法与有限域采样 | “本次采样看到了……” | “这条曲线无界” |
| E2 | 多法检查 | 独立网格/算法或窗口检查通过明示阈值 | “在这些设置下结果一致” | “已经严格认证” |
| E3 | 认证数值结论 | 有验证前提、区间包络、可检查证书 | “在给定域与假设下严格包含/唯一/不存在……” | “由此得出无限域的一般定理” |
| E4 | 形式化/数学证明 | 明确命题与证明链，经人类或形式系统可核查 | “已证明该具体命题” | 超出命题假设的推广 |

从低到高**不可自动推断**；E2 未必能够提升 E3，E3 的局部断言也不等于 E4 的全局命题。来源未知或条件不满足时显示 UNKNOWN，而不是暗示“安全”。

## 1. 数学对象与研究范围

核心标量场：f_θ : D ⊂ R² → R；定义域 D 有界矩形或受约束区域。θ 包含参数向量、相位、频率矩阵、随机种子。所有空间/函数输入必须包含：
- coordinateFrame、bounds、boundaryPolicy、units (无量纲也需说明)、resolution；
- functionSource：手工 AST / 具版本来源的预设 / 原始栅格 / CSV 或公开数据；
- differentiability：unknown/C0/C1/C2；
- derivativeSource：analytic / automatic differentiation / finite difference；
- valueType：float32 / float64 / validated interval（确认实现支持后才能选择）；
- displayTransform：视觉映射单独保存，不影响数学证据；
- interpolationType：nearest / bilinear / bicubic 及适用条件。

### 数学问题优先顺序
A. 子水平集和超水平集的连通性、洞、拓扑转变；B. 临界点与 Morse 型局部模型；C. 等值线分支的生成、合并、消失；D. 准周期函数的长期等值线行为（探索性）；E. 进一步的 3D 隐式场（更远期）。

**明确不是通用证明系统**：只承诺针对受支持函数类别实现部分可认证的有限域结论。

## 2. 数值可视化 → 科学可验证的核心挑战

- 网格采样可能漏掉狭窄连接、微小闭合轮廓；
- 歧义格（alternating signs）需要与所选单元内插值模型一致的判别器；
- 在临界高度附近，拓扑对扰动极敏感，固定百分比阈值没有普遍正确性；
- 窗口截断产生穿越边界的折线，不能归类为无限域上的“无界轨迹”；
- 退化临界点可能令 Newton 不收敛；Hessian 退化时应返回 unknown；
- 数学定义本身的周期性、准周期性、随机性必须证明或清楚标为模型假设；
- 图像像素分辨率、几何采样密度与数值求解精度是三个不同的概念。

### 现有 0.2 能力的正确标签
- Marching Squares 等值线：E1（已知示例可检验；并非完备认证）；
- 临界点候选：E1（有限差分与 Newton；退化区可能漏检）；
- 三档采样一致性：E2 风格的 **启发式筛查**，因尚缺独立算法、收敛/误差界，不应自动提升为通用 E2 研究结论；
- 23 高度事件候选：E1，不能作为严格临界值；
- 全局开放轨迹：未实现、不可宣称。

## 3. 数值认证架构分层

### Level N0：展示与感知层
Canvas/WebGL 渲染，独立于数值证据生成。图形滤镜和色彩不纳入研究判断。

### Level N1：确定性采样与基本测量
统一 double 精度在可信内核内进行主计算（必要时比 float64 更高）；记录所有参数与 hash。
- 划定坐标系和边界；收集细部不确定性标记；
- 保留当前 Marching Squares 作交互可视化；
- 预先区分数值误差、模型误差、输入数据误差、显示误差。

### Level N2：多尺度检验与独立实现
- 相同有限域、相同数学对象下比较 h, h/2, h/4 等逐级网格；
- 关键曲线在邻近高度的连通差异、Hausdorff 近似距离（注明方法）、长度与组件数；
- 另运行独立算法或 TTK/GUDHI 基线，自动生成差异；
- 对真实数据区分测量精度与数值分辨率；
- 若局部极大/极小/鞍点可用解析式求解，比较计算残差；
- 窗口扩大实验必须报告“进入/离开窗口”的影响，不可以把边界效应当拓扑突变。

### Level N3：针对受限类的认证
- 解析表达式或可靠可求界的函数，构建 interval arithmetic 求值；
- 使用 outward rounding、区间包络和区间 Newton/Krawczyk 验证：特定盒内驻点存在/唯一或不存在；证明 Hessian 特征判定适用时的局部类型；
- 对某些不含临界点的区域验证梯度不为 0，可用于局部拓扑稳定论证，但需要严格定理和前提；
- 认证失败或耗尽资源必须是 UNKNOWN/TIMEOUT，不得回退为 E3 PASS；
- E3 结果附有机读证书，配备独立验证器（算法输入输出格式不由网页渲染端“自说自话”）。

### Level N4：命题与数学证明
- 清楚地写出带量词、边界、正则性假设的命题；
- 引用文献中的严格定理时，必须核对当前函数族满足假设；
- 新命题要有可审查推导、反例搜寻和人工同行审核；可选 Lean 形式化，不声称自动生成证明可用；
- “无限平面存在无界水平线”不能仅从越来越大窗口图像推断。

## 4. Golden Benchmarks / 合成与解析基准

至少建立 30 组（G0 首批 12 组，G3 30 组），涵盖：

| 编号 | 数学对象 | 真值与应验证行为 | 典型失效 |
| --- | --- | --- | --- |
| B01 | f(x,y)=x | 对跨越 x=0 的矩形，c=0 是竖直线段，连接上、下边界 | 把边界穿越当无界证明 |
| B02 | f=x²+y² | c>0 单闭合圆；c<0 空集；c=0 退化点 | 虚假单像素轮廓 |
| B03 | f=x²−y² | 原点鞍点，附近等值线连接方式改变 | checkerboard 错配 |
| B04 | f=(x²+y²−1)² | 当 0<c<1 时子水平集为环带并有 1 个洞；c>1 时填入中心，洞消失 | 混淆子水平集与等值线 |
| B05 | f=−(x²+y²) | 极大点与超水平集变化 | 符号反转错误 |
| B06 | 两个各异高斯峰 | 随阈值改变组件合并/分裂 | 把相邻分量统计当完整轨迹 |
| B07 | f=x²+y²+ε(x⁴+y⁴) | 光滑、可做解析梯度对照 | 高阶细节被采样忽略 |
| B08 | f=(x²+y²)² | 退化驻点 Hessian=0 | Newton 假判 E3 |
| B09 | f=sin x+sin y | 预期周期平移关系 | 将周期误报准周期 |
| B10 | f=cos x+cos(√2 x)+cos y | x 方向的非公度频率使平面上通常不存在同时保留全部波项的二维平移周期；在有限窗观察 | 误把各自方向周期的两项叠加视为非周期 |
| B11 | 仅在边界达到极值的场 | 边界临界情况单列 | 裸统计误报内部临界 |
| B12 | 常值场 f≡c | 等值集合二维而非有限条曲线 | Marching Squares 无法正确表示 |
| B13 | 插入窄通道的双峰场 | 粗网格丢失连接，细网格恢复 | 错判稳定 |
| B14 | 带人为噪声的栅格 | 阈值拓扑波动明显 | 把测量噪声作新的数学结构 |
| B15 | 旋转后的周期晶格 | 坐标变换后数学结果应协变 | 坐标与像素耦合 |
| B16 | f(x,y)=x²y² | 非 Morse 退化临界集合 | 伪唯一性判断 |

进一步覆盖临界点重根、尖锐函数、非光滑函数、开窗周期边界、不同插值规则、极端缩放和缺测值，达 30 组以上。每例均具有 machine-readable expected assertions。

### 差异报告必须能回答
- 哪个模型、哪个窗口、哪个高度和哪个网格失败？
- 与哪一个参考算法/版本不符？
- 差异来自浮点、输入、边界还是算法？
- 是否可缩小成最小复现（minimized counterexample）？

## 5. 结构事件与持续同调（勿混淆概念）

### 基本对象
- 对每个阈值 c，分析下水平集 S_c={x∈D | f(x)≤c}；
- H0 描述连接组件；H1 描述洞；阈值演化中的 birth/death 配对生成 persistence diagram/barcode；
- Reeb graph / contour tree 提供等值集结构的图表示；不同空间拓扑与边界条件需选择适用数据结构；
- 单纯“某个高度等值线数变化”≠已知道发生了何种分支事件；
- 当使用栅格 cubical complex，必须固定 vertex/cell value 扩展、filtration 约定、tie breaking 和 boundary conditions。

### 路线
G3.1：组件树/H0；G3.2：H1、持久图，跨分辨率测稳定性；G3.3：临界点—树节点关联，局部事件定位；G3.4：单分支身份追踪，视觉显示实际证据。
必须参考 GUDHI Cubical Complex 和 TTK 的批处理接口结果进行比对。

## 6. 准周期研究子项目：Novikov Explorer

### 研究对象
构造 f(x,y)=F(K[x,y]^T+φ)，其中 F 在高维环面上周期，K、φ 的定义和秩明确。不要用任意余弦叠加视觉类似来代替数学定义。

### 开展问题
- 给定受控频率矩阵与参数角度，在哪些能级附近观察到长程边界穿越轨迹？
- 对增长的窗口半径 R，跨边界结构的数值指标如何变化？
- 旋转角接近特殊值时，观察轨迹长度分布如何变化？有无别名与网格方向的假象？
- 已有论文在哪些特例上给出严格结论，可否按其假设做数值复现？
- 观察到的新现象是否被已有理论、对称性、周期近似和采样网格解释？

### 严禁跨界叙事
- 不从有限绘图推导无限开曲线存在；
- 不把 2026 Maltsev 某一特殊函数族的结论推广到任意“四余弦叠加”；
- 不把“用户第一次看到”说成世界首次发现；
- 论文结论应精确标注具体条件、数学记号、版本和适用范围。

参考：
- Dynnikov & Novikov 2005 https://www.mathnet.ru/php/archive.phtml?jrnid=rm&option_lang=eng&paperid=1386&wshow=paper
- Dynnikov, Maltsev & Novikov 2022/2023 https://arxiv.org/abs/2306.11257
- Maltsev 2024 https://www.mathnet.ru/php/archive.phtml?jrnid=tm&option_lang=eng&paperid=4394&wshow=paper
- Maltsev 2026 https://rcd.ics.org.ru/S1560354726510027/

## 7. 实验包与可审计的数据契约（schema 设计草案）

格式命名：ExperimentBundle/1.0（**计划，不是当前已部署 API**）。

~~~
{
  "schema": "quasi-atlas.experiment/1.0",
  "createdAt": "ISO-8601",
  "experimentId": "UUIDv7-or-content-derived-id",
  "question": "用户的问题",
  "hypothesis": "可证伪的判断",
  "model": {
    "kind": "analytic | preset | raster",
    "expressionAst": {},
    "expressionHash": "sha256...",
    "smoothness": "C2 | unknown",
    "parameters": {},
    "coordinateFrame": "cartesian",
    "units": {"x": "dimensionless", "y": "dimensionless", "f": "dimensionless"},
    "domain": {"xmin": -10, "xmax": 10, "ymin": -10, "ymax": 10},
    "boundary": "clipped-rectangle"
  },
  "numerics": {
    "solverId": "name/version",
    "commit": "git-sha",
    "dependencyLockHash": "sha256...",
    "floatFormat": "binary64",
    "grid": [512, 512],
    "interpolation": "bilinear",
    "tolerance": {},
    "seed": null,
    "errorBudget": {}
  },
  "evidence": {
    "level": "E1 | E2 | E3 | E4",
    "claimScope": "finite-domain | conditional",
    "results": [],
    "warnings": [],
    "certificateRef": null,
    "independentChecks": []
  },
  "provenance": {
    "sourceType": "synthetic | external | uploaded",
    "sourceUri": null,
    "license": null,
    "dataHash": null
  },
  "notes": {
    "observation": "...",
    "counterexamples": [],
    "limitations": ["..."]
  }
}
~~~

后续需固定 canonical JSON、NaN/Infinity 处理、浮点 round-trip 精度、排序、hash 范围、Schema migration 与旧版本导入策略。渲染设置另存 presentation，不得参与数学事实 hash。

### 可复现性验收
- 新设备使用相同版本环境与输入运行，结果在已申明容差内一致；
- 若 GPU/平台无法满足相同精度，报告必须明确列出差异；
- 实验包不依赖用户账户或私有服务器可打开；
- 数据来源字段缺失则不得标注为“使用真实观测数据”；
- 所有导出可由 headless CI 独立解析和核对。

## 8. 质量体系

| 层 | 最低测试要求 | 研究级放行条件 |
| --- | --- | --- |
| Unit tests | 解析函数真值与小例子 | 30+ golden fixtures，全部可复现 |
| Property tests | 坐标平移/旋转/单调重参数 | 数学应保持不变量的场合结果一致 |
| Differential tests | 至少两独立实现、TTK/GUDHI | 差异可解释；不能静默 |
| Precision tests | h/h2/h4、域增长、容差变化 | 误差/稳定域可报告 |
| Certification tests | 容差/退化/失败等负例 | UNKNOWN 不会被误报 CERTIFIED |
| Research replay | 实验包 hash 和锁文件 | 无后端也能重算；版本差异显式 |
| UI pedagogy | 错误语义测试 | 普通用户能区分推测与证明 |
| Security | 不可信公式输入、外部数据 | AST 解析，不 eval；尺寸上限、取消与 Worker 隔离 |

## 9. 伦理、开放与审核

- 论文复现实验应尊重论文准确性和版权；
- 下载 TTK/GUDHI 等工具时复核各子模块许可证、分发要求与安全维护；
- AI 可提出候选/生成解释，但不得自动把 E1/E2 升级成 E3/E4；
- 数学专家审核清单至少涵盖定义、假设、边界、算法与误差宣称；
- 实际用户数据默认本地处理、权限控制、仅主动分享，删除/export 明确；
- 教学例子不得冒充天气预报、医疗诊断或工程安全决策依据。

## 10. 文献与工具基础

- Topology Toolkit https://topology-tool-kit.github.io/
- GUDHI Cubical Complex https://gudhi.github.io/cubicalcomplex/
- NIST DLMF Interval arithmetic https://dlmf.nist.gov/3.1
- FAIR research data principles https://www.nature.com/articles/sdata201618
- JupyterLite browser-based science https://jupyterlite.readthedocs.io/en/stable/
- Novikov 相关数学文献见第 6 节。

**科学签字原则：本文件中的 E3/E4、可靠同调与严格批处理是“目标能力”，未经外部专家/独立 verifier 验证之前不得以“科研认证已完成”对外宣传。**
