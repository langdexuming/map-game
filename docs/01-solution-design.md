# 01 · 方案设计 (Solution Design)

> 总体架构、模块依赖、技术栈、ER 图、状态机、关键时序图。

---

## 1.1 总体分层架构

```mermaid
graph TB
    subgraph Client["客户端层 · Cocos Creator / TS"]
        UI["UI 层<br/>世界地图 / 行程卡 / 任务面板"]
        Logic["前端逻辑层<br/>回合管理 / 路径动画 / 视图切换"]
        Net["网络层<br/>HTTP + WebSocket"]
    end

    subgraph Gateway["网关层"]
        GW["Spring Cloud Gateway<br/>鉴权 / 限流 / 路由"]
    end

    subgraph Service["服务层 · Spring Boot 3"]
        S1["世界服务<br/>WorldService"]
        S2["特工服务<br/>AgentService"]
        S3["任务服务<br/>MissionService"]
        S4["★ 出行服务<br/>TravelService"]
        S5["建造研究<br/>BuildService"]
        S6["回合调度<br/>TurnScheduler"]
    end

    subgraph Storage["存储层"]
        DB[(MySQL<br/>玩家/地图/任务)]
        Cache[("Redis<br/>在途行程/班次/排行")]
        MQ[/"RabbitMQ<br/>事件广播"/]
    end

    UI --> Logic --> Net --> GW
    GW --> S1 & S2 & S3 & S4 & S5
    S6 -. 定时回合推进 .-> S4
    S6 -. 定时回合推进 .-> S3
    S1 & S2 & S3 & S4 & S5 --> DB
    S4 --> Cache
    S3 & S4 --> MQ
    MQ -. WebSocket 推送 .-> Net
```

---

## 1.2 模块依赖关系

```mermaid
graph LR
    World[世界地图] --> Travel[出行系统★]
    World --> Mission[任务系统]
    Agent[特工队伍] --> Travel
    Agent --> Mission
    Travel --> Mission
    Travel --> Resource[资源系统]
    Mission --> Resource
    Build[建造研究] --> Resource
    Build --> Travel
    Event[事件系统] --> Travel
    Event --> Mission

    style Travel fill:#ffd866,stroke:#333,stroke-width:3px
```

> **黄色高亮**的「出行系统」是这次叠加的核心：向上承接任务、向下消耗资源、被建造解锁、被事件干扰。

---

## 1.3 技术栈选型

```mermaid
graph TB
    subgraph 前端
        A1[Cocos Creator 3.8]
        A2[TypeScript 5]
        A3[Protobuf]
    end
    subgraph 后端
        B1[JDK 17]
        B2[Spring Boot 3.2]
        B3[MyBatis-Plus 3.5]
        B4[Lombok + Swagger3]
        B5[Quartz / XXL-Job]
    end
    subgraph 中间件
        C1[(MySQL 8)]
        C2[(Redis 7)]
        C3[/RabbitMQ/]
        C4[Nacos 配置中心]
    end
    subgraph 部署
        D1[Docker]
        D2[Kubernetes]
        D3[Nginx]
    end
```

---

## 1.4 领域模型 ER 图

```mermaid
erDiagram
    PLAYER ||--o{ TEAM : owns
    TEAM ||--o{ AGENT : contains
    TEAM ||--o{ TRIP : takes
    PLAYER ||--o{ MISSION : accepts
    
    REGION ||--o{ CITY : has
    CITY ||--o{ ROUTE : "from/to"
    ROUTE ||--o{ TRIP : runs_on
    VEHICLE ||--o{ ROUTE : supports
    
    MISSION ||--o{ TRIP : may_require
    TRIP ||--o{ TRIP_EVENT : triggers
    
    PLAYER {
        bigint id PK
        string name
        int level
        int coin
        int clue
        int star
    }
    REGION {
        bigint id PK
        string name
        string theme
    }
    CITY {
        bigint id PK
        bigint region_id FK
        tinyint level "1Hub 2Region 3Outpost"
        decimal lng
        decimal lat
    }
    ROUTE {
        bigint id PK
        bigint from_city FK
        bigint to_city FK
        tinyint vehicle_type
        int distance
        int base_price
        int base_turn
    }
    TRIP {
        bigint id PK
        bigint team_id FK
        bigint route_id FK
        tinyint status
        int start_turn
        int arrive_turn
    }
    AGENT {
        bigint id PK
        string name
        int hp
        int defense
        int level
    }
    MISSION {
        bigint id PK
        string title
        tinyint type "护送/追踪/拦截/..."
        bigint target_city FK
    }
```

---

## 1.5 行程状态机（Trip State Machine）

```mermaid
stateDiagram-v2
    [*] --> 草稿: 玩家在规划器选起终点
    草稿 --> 已订票: 选定方案+扣金币
    草稿 --> [*]: 取消规划
    已订票 --> 在途: 到达出发回合
    已订票 --> 已退票: 主动退票(扣手续费)
    在途 --> 在途: 触发路上事件
    在途 --> 已到达: 抵达终点
    在途 --> 中断: 极端事件/被劫持
    中断 --> 在途: 完成救援/绕路
    中断 --> 失败: 救援失败
    已到达 --> [*]
    已退票 --> [*]
    失败 --> [*]
```

---

## 1.6 关键流程：「行程预订」时序图

```mermaid
sequenceDiagram
    autonumber
    participant U as 玩家
    participant C as 客户端
    participant GW as 网关
    participant T as TravelService
    participant W as WorldService
    participant R as Redis
    participant DB as MySQL

    U->>C: 点击地图两个城市
    C->>GW: POST /travel/plan {from,to,teamId}
    GW->>T: 路由
    T->>W: 取节点+路径(Dijkstra)
    W-->>T: 路径候选集
    T->>R: 查当前回合班次/票价
    R-->>T: 时刻表
    T-->>C: 返回 3 套 TripPlanVO(快/省/稳)
    C-->>U: 弹出"行程卡"
    U->>C: 选定方案②
    C->>GW: POST /travel/book
    GW->>T: 
    T->>DB: 扣金币 + 创建Trip
    T->>R: 行程入"在途集合"
    T-->>C: tripId
    C-->>U: 飞机动画起飞
    Note over T: 每回合推进时<br/>由TurnScheduler<br/>批量结算
```

---

## 1.7 后端代码规范摘要（与团队 Java 规范对齐）

- 接口参数统一使用 `XxxQuery` 实体接收，**禁止 Map**
- 接口返回统一使用 `XxxVO` 并加 `@ApiModelProperty`，**禁止 Map**
- 所有类必须有 `@author make java` + `@since 日期` 注释
- 实体类强制 Lombok `@Data`
- 日志统一 `@Slf4j`，捕获异常未抛出必须打日志
- 配置项统一在 `Configuration` 类静态字段，不在 Service 直接 `@Value`
- Redis 多 key 使用 `multiGet` 批量操作
- `if` 必须带大括号，禁止行尾注释
