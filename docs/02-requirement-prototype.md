# 02 · 需求原型 (Requirement Prototype)

> 用例图、用户旅程、信息架构、UI 线框稿、需求清单。

---

## 2.1 用例图（玩家视角）

```mermaid
graph LR
    P((玩家))
    P --> UC1[查看世界地图]
    P --> UC2[组建队伍]
    P --> UC3[接取任务]
    P --> UC4[★规划行程]
    P --> UC5[★购票/订座]
    P --> UC6[★路上应对事件]
    P --> UC7[完成任务结算]
    P --> UC8[建造与研究]
    P --> UC9[切换地图视图]

    UC4 -.include.-> UC9
    UC5 -.include.-> UC4
    UC6 -.extend.-> UC5
    UC7 -.include.-> UC5

    style UC4 fill:#ffd866
    style UC5 fill:#ffd866
    style UC6 fill:#ffd866
```

---

## 2.2 玩家核心循环（User Journey）

```mermaid
flowchart LR
    A[登录/进入存档] --> B[查看 Mission Briefs]
    B --> C{有合适任务?}
    C -- 否 --> D[切换 Explorer 视图<br/>主动探索新城市]
    C -- 是 --> E[Team Up 选队]
    E --> F[★ 打开行程规划器]
    F --> G[★ 比较 3 套方案]
    G --> H[★ 订票 + 扣资源]
    H --> I[结束本回合 → 推进]
    I --> J{在途事件?}
    J -- 是 --> K[★ 路上小决策<br/>风暴/海盗/线索]
    J -- 否 --> L[抵达目的地]
    K --> L
    L --> M[执行任务/收集线索]
    M --> N[结算: Coin+Star+Clue]
    N --> O{触发新任务?}
    O -- 是 --> B
    O -- 否 --> P[基地内: 建造/研究]
    P --> A

    style F fill:#ffd866
    style G fill:#ffd866
    style H fill:#ffd866
    style K fill:#ffd866
```

---

## 2.3 主界面信息架构

```mermaid
graph TB
    Top["顶部状态栏：Coins · Clues · Stars · Day/Turn · ⚙ 设置"]
    Left["左栏：队伍列表(Team Alpha 5人)"]
    Center["中央：世界地图 (Explorer/Resource/Team/★Travel 四视图)"]
    Right["右栏：Event Feed · Mission Briefs · Research Progress · ★Travel Briefs"]
    BottomL["左下：MapViews · MiniMap · ★班次时钟"]
    BottomC["底部中：Build Menu (Base/Research/Units/Trade/★Transit)"]
    BottomR["底部右：Active Unit (Play/TeamUp/Find/Protect/★Travel)"]
    Log["右下：Mission Log + ★Trip Log"]

    Top --- Left
    Top --- Center
    Top --- Right
    Left --- BottomL
    Center --- BottomC
    Right --- Log
    BottomR --- Log
```

---

## 2.4 UI 高保真线框稿

![UI Wireframe](../assets/ui-wireframe-main.png)

**关键变更点（对比原作）**：

1. 左栏 Map Views **新增第 4 个 ★ Travel Map**（金色高亮）
2. 右栏 **新增 ★ Travel Briefs** 面板，与 Mission Briefs 平级
3. 左下 MiniMap 旁 **新增"班次时钟" Next Flight T+2**
4. 底部 Build Menu **新增第 5 颗按钮 ★ Transit**
5. 底部 Active Unit **新增第 5 颗按钮 ★ Travel**
6. 右下 **新增 ★ Trip Log** 行程历史
7. 顶部 **新增 Fuel 燃料**资源状态（出行核心限制）
8. 地图上 **3 类路径线**：黄虚线（飞机）/ 蓝实线（轮船）/ 棕点线（火车）

---

## 2.5 行程规划器面板（细节交互）

```mermaid
flowchart TB
    Start[点击地图节点 A] --> SecondClick[再点节点 B]
    SecondClick --> Open[弹出 行程规划器]
    Open --> Show[展示 3 套方案<br/>①最快 ②最省 ③最稳]
    Show --> Hover{Hover 方案?}
    Hover -- 是 --> Preview[地图上预览路径<br/>飞机/船/火车图标点亮]
    Preview --> Show
    Hover -- 否 --> Choose{点击 Confirm?}
    Choose -- 否 --> Show
    Choose -- 是 --> Check{资源够吗?}
    Check -- 否 --> Toast[提示金币不足]
    Toast --> Show
    Check -- 是 --> Deduct[扣金币 + 燃料 + 疲劳]
    Deduct --> Create[创建 Trip 记录<br/>状态=已订票]
    Create --> Anim[飞机动画就位<br/>等待回合推进]
    Anim --> End([关闭面板])
```

---

## 2.6 功能需求清单（验收标准）

| 编号 | 需求 | 优先级 | 验收标准 |
|------|------|--------|----------|
| FR-01 | 任意两节点间能算出 ≥1 条路径 | P0 | Dijkstra 单测覆盖 |
| FR-02 | 行程规划器返回 3 种偏好方案 | P0 | 快/省/稳各 1 套 |
| FR-03 | 订票扣 Coin/Fuel/Fatigue | P0 | 余额校验 + 事务回滚 |
| FR-04 | 在途回合掷事件骰 | P1 | 概率配置可调 |
| FR-05 | 极端天气可关闭航线 | P1 | 标记 Route.disabled |
| FR-06 | VIP 护送任务串联 Trip | P1 | 任务挂 trip_id |
| FR-07 | 班次时刻表按回合刷新 | P2 | Quartz 5 分钟级 |
| FR-08 | Travel Map 视图独立高亮 | P0 | 4 视图切换 ≤200ms |
| FR-09 | Trip Log 历史记录 | P2 | 30 天保留 |
| FR-10 | 退票/改签 | P2 | 手续费 30% |

---

## 2.7 非功能需求

| 类别 | 指标 |
|------|------|
| 响应时间 | 行程规划 ≤ 500ms、地图视图切换 ≤ 200ms |
| 并发 | 单服支持 ≥ 1000 在线玩家 |
| 可用性 | 99.5% |
| 数据一致性 | 订票走分布式事务（Seata 或本地消息表） |
| 可玩性 | 单局 30 分钟内可推进 ≥ 3 个任务 |
| 适龄 | 6+ 岁，无暴力血腥 |
