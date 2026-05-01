# map-game-client · 客户端

> 小小特工 · 出行特工版 · Cocos Creator 3.8 + TypeScript 客户端脚手架

## 工程结构

```text
client/
├── package.json
├── tsconfig.json
├── .gitignore
└── assets/
    └── scripts/
        ├── api/                   # 与后端契约一一对应
        │   ├── types.ts           # VO/Query TS 类型 (与 server 同步)
        │   ├── HttpClient.ts      # 统一 fetch 封装 + BizError
        │   ├── WorldApi.ts        # S1 World 接口
        │   └── TravelApi.ts       # S4 Travel 接口 (占位)
        ├── core/                  # 框架层
        │   ├── EventBus.ts        # 全局事件总线
        │   ├── GameStore.ts       # 全局游戏状态
        │   └── TurnManager.ts     # 回合管理
        ├── world/                 # S1 世界地图
        │   ├── WorldScene.ts      # 主场景脚本
        │   ├── MapLayer.ts        # 节点/路径渲染
        │   ├── NodeSprite.ts      # 单城市节点
        │   ├── MapViewSwitcher.ts # 4 视图按钮互斥
        │   └── renderers/
        │       ├── MapViewRenderer.ts
        │       ├── ExplorerRenderer.ts
        │       ├── ResourceRenderer.ts
        │       ├── TeamRenderer.ts
        │       └── TravelRenderer.ts   ★ 5 类航线着色
        ├── travel/                # ★ S4 出行
        │   └── TripPlannerCard.ts
        └── ui/
            └── TopStatusBar.ts
```

## 如何接入 Cocos Creator 3.8

1. 安装 [Cocos Dashboard](https://www.cocos.com/creator) 并下载 Creator 3.8.x
2. **新建空项目** → 选 2D 模板，目录指向本 `client/` 文件夹
3. Creator 会自动识别 `assets/` 下的脚本，编译生成 `library/` `temp/`（已被 .gitignore 忽略）
4. 在编辑器中：
   - 新建 Scene `MainScene.scene`
   - 根节点挂 `WorldScene.ts`
   - 子节点 `MapLayer` 节点挂 `MapLayer.ts`
   - 子节点 `MapViews` 节点挂 `MapViewSwitcher.ts` 并拖入 4 个 Button
   - 子节点 `TopStatusBar` 节点挂 `TopStatusBar.ts` 并拖入 5 个 Label
   - 子节点 `TripPlannerCard` 节点挂 `TripPlannerCard.ts` 并拖入 panel/labels
5. 生成 `NodeSprite.prefab`：含 1 张 Sprite + 1 个 Label，挂 `NodeSprite.ts`，拖到 `MapLayer.nodeSpritePrefab` 字段
6. 在 `assets/scripts/api/HttpClient.ts` 中确认 `baseUrl` 指向后端 (默认 `http://127.0.0.1:8080/api`)
7. 启动后端：`cd ../server && docker compose up -d && mvn spring-boot:run`
8. 编辑器 F7 启动模拟器，看到 Default Save 世界 + 6 个城市

## 设计要点

- **完全解耦**：API / Core 层是纯 TS（不依赖 cc 模块），可在 Node.js 单元测试
- **事件总线**：跨模块通信走 `EventBus`，避免 Component 之间硬引用
- **类型一致**：所有 `interface` 与后端 `XxxVO/XxxQuery` 字段一一对应
- **错误统一**：服务端 `Result.code != 0` 统一抛 `BizError`，UI 层捕获显示

## 与后端规范一致

虽然这是 TS 工程，但仍保持与团队 Java 规范精神一致：

- ✅ 所有类/方法带 `@author make java` + `@since` JSDoc
- ✅ `if/for` 强制大括号
- ✅ 不用 `any`（HTTP 解包用泛型）
- ✅ 异常 catch 必须打 `console.error/warn`
- ✅ 不在业务代码裸露字符串配置（走 `GameStore` / `HttpClient.setBaseUrl`）

## 待实现 (按 Sprint 推进)

- [x] S1 WorldScene + MapLayer + NodeSprite + ViewSwitcher
- [x] S4 TripPlannerCard 占位
- [ ] S2 LeftTeamPanel + TeamUpDialog
- [ ] S3 MissionBriefsPanel + MissionLogPanel
- [ ] S4 ScheduleClock + TripEventDialog + 飞机贝塞尔动画
- [ ] S5 BuildMenu + ResearchTreeView
- [ ] S6 EventCardDialog + GMPanel
- [ ] WebSocket 接入 (推送 trip-event / mission-completed / event-pop)
