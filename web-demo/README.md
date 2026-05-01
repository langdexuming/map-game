# web-demo · S4 出行可玩 Demo

> 浏览器即开即玩，完整演示「点两点 → 算 3 套方案 → 订票 → 飞机沿曲线动起来 → 路上事件骰 → 抵达」全闭环。  
> **零依赖**：原生 HTML + ES Module + Canvas，不需要 npm install。

## 🎮 如何玩

### 🅰 方式 1: 双击 standalone.html（最简单 ⭐ 推荐）

直接 **双击 `web-demo/standalone.html`** 即可在浏览器中游玩。  
单文件版（HTML+CSS+JS 全部内联），**不需要服务器**，**不需要 Python/Node**。

### 🅱 方式 2: Python 内置服务器（开发推荐）

```bash
cd web-demo
python -m http.server 5500
# 浏览器打开 http://127.0.0.1:5500
```

> ⚠️ 注意：直接双击 `index.html` 会失败（浏览器对 `file://` 阻止 ES Module）。  
> 这是 ES Module 的 CORS 限制，要么用方式 🅰 standalone.html，要么用方式 🅱 起服务器。

### 🅲 方式 3: Node 一行命令

```bash
npx serve web-demo -p 5500
```

### 🅳 方式 4: VS Code "Live Server" 插件

右键 `index.html` → Open with Live Server

## 📄 两个版本对比

| 文件 | 适用场景 | 优势 | 限制 |
|------|---------|------|------|
| `standalone.html` | **快速演示 / 评审** | 双击即开, 无依赖, 单文件 27KB | 无法接真后端 |
| `index.html` + `js/*.js` | **开发 / 接后端** | 模块化, 可独立改 data/planner/map | 需要 HTTP 服务器 |

## 🕹️ 玩法

1. **看图**：6 个城市分布在 5 大陆上（与后端 V1+V4 SQL 种子完全一致）
2. **看路**：22 条路径分 5 种颜色（黄飞机 / 蓝船 / 棕火车 / 灰卡车 / 绿越野）
3. **点出发地** → 该城市描金边
4. **点目的地** → 弹出 **行程规划器** 显示 3 套方案（最快 / 最省 / 最稳）
5. **点选方案** → 扣金币 + 燃料 → 飞机/船图标在地图上沿贝塞尔曲线就位
6. **点 [End Turn ▶]** → 推进 1 回合 → 60% 概率掷路上事件骰
   - 偶遇线索 / 小麻烦 / 天气延迟 / 强盗（弹模态选项！）/ 隐藏支线
7. **抵达** → 自动结算，Trip Log 留痕

## 🎯 验收点（对应 S4 设计文档）

| 设计项 | Demo 行为 |
|--------|-----------|
| Dijkstra 算路 | `js/planner.js` 三次 Dijkstra，偏好快/省/稳 |
| 3 套方案 | 规划器卡片同时展示，鼠标点击订票 |
| 多式联运 | 同一行程支持飞机+船+火车混合段 |
| 资源消耗 | 金币、燃料分别校验 |
| 在途事件骰 | `data.js` 的 6 类事件 + 加权随机 |
| 互动事件 | 强盗事件弹模态，3 选项含「贿赂」金币门槛 |
| 贝塞尔动画 | 飞机/船/火车 emoji 沿曲线插值移动 |
| Trip Log | 右下面板按回合记录 |

## 📁 文件结构

```text
web-demo/
├── index.html          # 入口 (顶部状态栏 + 地图 + 规划器)
├── style.css           # 米黄+蓝海洋的儿童友好风格
├── README.md
└── js/
    ├── data.js         # 6 城市 + 22 路径 + 6 类事件 (与 SQL 一致)
    ├── planner.js      # Dijkstra + 多目标方案
    ├── map.js          # Canvas 渲染 + 贝塞尔曲线 + 命中检测
    └── main.js         # 主控状态机 + UI 绑定 + 行程生命周期
```

## 🔌 接真实后端（可选）

`js/main.js` / `js/planner.js` 已与后端 OpenAPI 契约一致。要切到真实后端：

1. 启动后端：`cd ../server && docker compose up -d && mvn spring-boot:run`
2. 在 `js/planner.js` 顶部加：
   ```js
   const REAL = true;
   export async function planTrip(from, to) {
     if (REAL) {
       const r = await fetch('http://127.0.0.1:8080/api/travel/plan', {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ fromCityId: from, toCityId: to, teamId: 1, preference: 1 }),
       });
       const j = await r.json();
       return j.code === 0 ? { plans: j.data } : { error: j.message };
     }
     // ... 原 mock 逻辑
   }
   ```

> 后端 S4 接口（`/travel/plan`、`/travel/book`）尚未实现，待下一轮交付。

## 🎨 风格说明

- 米黄羊皮纸背景 + 蓝色海洋 Canvas 呼应原作《Agents: Global Control》
- 5 类载具 5 种颜色，符合视觉一致性
- 国际枢纽（金）/ 区域城市（绿）/ 据点（灰）三色区分
