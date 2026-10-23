# Quasi Atlas 0.2 — 发现 → 定位 → 验证 → 记录

本地项目：`/Users/wahaha/Documents/Me/Project/cursor/quasi-atlas`

## 一键启动（macOS）

双击 `scripts/start.command`。首次会安装依赖，然后打开本地网站。浏览器地址：**http://127.0.0.1:5188/**

如果 macOS 拦截 `.command`，在 Terminal 中执行：

```bash
cd /Users/wahaha/Documents/Me/Project/cursor/quasi-atlas
bash scripts/start.command
```

## 从终端启动

```bash
cd /Users/wahaha/Documents/Me/Project/cursor/quasi-atlas
npm install
npm run start
```

在浏览器访问 **http://127.0.0.1:5188/**。终端窗口保持运行。停止时在那个窗口按 `Control + C`。

如果 5188 已被使用，运行 `npm run dev` 让 Vite 自动选择空闲端口，打开终端输出的 Local 地址。

## 功能使用步骤

1. 在左侧选数学世界，用底部潮位滑块寻找明显的图形变化；事件轴只能标记离散采样差异候选。
2. 在右侧点击 **寻找临界点**：使用数值有限差分和 Newton 方法在当前窗口定位极小值、极大值及鞍点候选，列表里的点可以点击放大。
3. 点击某个候选会将视图中心移至该点、缩小观察范围，并把等值高度设置在候选值附近。
4. 点击 **三档精度验证**：在相同有限窗口，分别用横向 120、220、340 个网格以及三个相近高度比较等值线统计值。若相邻两档网格的闭合/边界计数一致且曲线长度相对差小于 4.5%，标为 **观察一致**。这只是启发式筛查，不是证明。
5. 点击 **导出验证报告 JSON**：包含采样范围、取样分辨率、三个高度的统计、误差、算法版本及数学限制；同时支持原有 PNG、SVG 和全量研究数据 JSON。

## 科学边界

- **不是**“严格自适应网格求解器”，也没有实现持久同调、连续分支追踪或 Novikov 问题的数学证明。
- 有限差分临界点是**候选解**，接近退化驻点或数值不稳定处可能误判或漏判。
- 结构事件只是有限网格统计差异，拓扑变化可能来自窗口边界、网格别名、未解析细部。
- “观察一致”的定义只比较有限三个高度和网格，在更高精度上仍可能变化。

## 测试

```bash
npm test
npm run build
```

完整自动化浏览器测试要求 Chrome/Playwright（本机已有）：网站先在端口 5188 运行，再执行 `node scripts/smoke.mjs`。

## 目录

- `src/math/fields.js`：数学标量场
- `src/math/contours.js`：Marching Squares，双线性渐近判别器，候选事件轴
- `src/math/verify.js`：三档网格数值观察一致性检查、有限差分临界点候选
- `src/worker.js`：独立线程执行计算
- `src/main.js`：响应式地图、实验交互、数据导出
- `docs/PRODUCT_VISION.md`：设计目标与科学界限

未来研究级路线：细粒度自适应采样、误差界验证、跨分辨率几何匹配、可追踪的临界分支、数值实验用例库。
