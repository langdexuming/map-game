# S4 · 出行系统实现图 ★ (Travel System)

> **目标**：实现"打开规划器 → 路径算法 → 3 套方案 → 订票 → 在途事件 → 抵达"完整闭环。  
> **周期**：3 周（最长）。  
> **依赖**：S1（地图）、S2（队伍）、S3（任务可挂行程）。  
> **本 Sprint 是叠加"出行元素"的核心交付。**

---

## 1. 类图 (Class Diagram)

```mermaid
classDiagram
    class Vehicle {
        <<enumeration>>
        PLANE
        SHIP
        TRAIN
        TRUCK
        FOOT
    }

    class Route {
        +Long id
        +Long fromCity
        +Long toCity
        +Vehicle vehicleType
        +Integer distance
        +Integer basePrice
        +Integer baseTurn
        +Boolean disabled
        +realPrice(turn) Integer
    }

    class Trip {
        +Long id
        +Long teamId
        +List~Long~ routeIds
        +TripStatus status
        +Integer startTurn
        +Integer arriveTurn
        +Integer paidCoin
        +start()
        +advance(currentTurn)
        +cancel()
    }

    class TripStatus {
        <<enumeration>>
        DRAFT
        BOOKED
        IN_TRANSIT
        ARRIVED
        REFUNDED
        FAILED
    }

    class TripPlan {
        +Integer planNo
        +List~Vehicle~ vehicleChain
        +List~Route~ routes
        +Integer totalTurn
        +Integer totalPrice
        +Integer eventExpect
        +String bonusDesc
    }

    class TripEvent {
        +Long id
        +Long tripId
        +String eventCode
        +Integer happenedTurn
        +Object payload
    }

    class Schedule {
        +Long id
        +Long routeId
        +Integer turnInterval
        +Integer nextDepartTurn
    }

    class TravelPlanner {
        +planTrip(query) List~TripPlan~
        -dijkstra(from, to) List~Route~
        -multiCriteria(paths) List~TripPlan~
    }

    class TravelEventDice {
        +roll(trip, turn) TripEvent
    }

    Route --> Vehicle
    Trip --> TripStatus
    Trip "1" --> "*" TripEvent
    Schedule --> Route
    TravelPlanner ..> Route
    TravelPlanner ..> TripPlan
    TravelEventDice ..> TripEvent
```

---

## 2. 行程完整生命周期

```mermaid
stateDiagram-v2
    [*] --> DRAFT: 玩家点两节点 -> 弹规划器
    DRAFT --> BOOKED: 选定方案 + 扣金币/燃料
    DRAFT --> [*]: 关闭规划器
    BOOKED --> IN_TRANSIT: 到达 startTurn
    BOOKED --> REFUNDED: 主动退票 (扣 30%)
    IN_TRANSIT --> IN_TRANSIT: 路上事件骰
    IN_TRANSIT --> ARRIVED: 到达 arriveTurn
    IN_TRANSIT --> FAILED: 全灭/任务失败
    ARRIVED --> [*]
    REFUNDED --> [*]
    FAILED --> [*]
```

---

## 3. 表结构 (DDL)

```sql
-- 路径
CREATE TABLE route (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  from_city       BIGINT NOT NULL,
  to_city         BIGINT NOT NULL,
  vehicle_type    TINYINT NOT NULL COMMENT '1-Plane 2-Ship 3-Train 4-Truck 5-Foot',
  distance        INT NOT NULL,
  base_price      INT NOT NULL,
  base_turn       INT NOT NULL,
  disabled        TINYINT DEFAULT 0,
  INDEX idx_from (from_city),
  INDEX idx_to (to_city)
) COMMENT='路径';

-- 班次
CREATE TABLE schedule (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  route_id        BIGINT NOT NULL,
  turn_interval   INT DEFAULT 3 COMMENT '班次周期',
  next_depart_turn INT NOT NULL,
  UNIQUE KEY uk_route (route_id)
) COMMENT='班次';

-- 行程
CREATE TABLE trip (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  team_id         BIGINT NOT NULL,
  player_id       BIGINT NOT NULL,
  mission_id      BIGINT COMMENT '关联任务 (可空)',
  route_ids       VARCHAR(512) COMMENT 'JSON, 多段拼接',
  status          VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
  start_turn      INT,
  arrive_turn     INT,
  paid_coin       INT,
  paid_fuel       INT,
  INDEX idx_player (player_id),
  INDEX idx_status (status)
) COMMENT='行程';

-- 路上事件
CREATE TABLE trip_event (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  trip_id         BIGINT NOT NULL,
  event_code      VARCHAR(32) NOT NULL,
  happened_turn   INT NOT NULL,
  payload         JSON,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_trip (trip_id)
) COMMENT='路上事件';
```

---

## 4. 核心算法：Dijkstra 多式联运 + 多目标方案

### 4.1 算法流程

```mermaid
flowchart TB
    Start[输入 from/to/preference] --> Build[构建有向图<br/>Node=City, Edge=Route]
    Build --> Filter[过滤 disabled=1 的边]
    Filter --> Pref{偏好}
    Pref -- 最快 --> W1[Edge.weight=baseTurn]
    Pref -- 最省 --> W2[Edge.weight=basePrice]
    Pref -- 最稳 --> W3[Edge.weight=eventRate*100]
    W1 --> Dij1[Dijkstra]
    W2 --> Dij2[Dijkstra]
    W3 --> Dij3[Dijkstra]
    Dij1 --> P1[Plan ① 最快]
    Dij2 --> P2[Plan ② 最省]
    Dij3 --> P3[Plan ③ 最稳]
    P1 & P2 & P3 --> Diff{方案重复?}
    Diff -- 是 --> Replace[K-Shortest Path 取次优]
    Diff -- 否 --> Out
    Replace --> Out[返回 3 套 TripPlan]
```

### 4.2 伪代码

```text
function planTrip(from, to, preference):
    graph = buildGraph(filter disabled)
    plans = []
    for w in [TURN, PRICE, RISK]:
        path = dijkstra(graph, from, to, weightFn=w)
        plans.add(toTripPlan(path))
    if plans.distinct().size < 3:
        plans = ksp(graph, from, to, k=3)
    return plans.sortBy(planNo)
```

### 4.3 复杂度

- N=100 城市 / M=400 路径
- 单次 Dijkstra: O((N+M)logN) ≈ 数毫秒
- 全图 Hub-Hub 最短路在启动时**预计算缓存到 Redis**

---

## 5. 关键时序：「打开规划器 → 订票 → 路上事件 → 抵达」

```mermaid
sequenceDiagram
    autonumber
    participant U as 玩家
    participant C as 客户端
    participant T as TravelService
    participant W as WorldService
    participant Sch as TurnScheduler
    participant Dice as TravelEventDice
    participant Res as ResourceService
    participant DB as MySQL
    participant R as Redis
    participant MQ as RabbitMQ

    U->>C: 点击 Aegis HQ -> 再点 Nova Base
    C->>T: POST /travel/plan {from,to,teamId}
    T->>R: GET hub:routes:graph
    alt 缓存命中
        R-->>T: graph
    else miss
        T->>W: 查 city/route 重建
        W-->>T: graph
        T->>R: SETEX 1h
    end
    T->>T: 3 次 Dijkstra
    T-->>C: List<TripPlanVO> 3 套
    C-->>U: 弹出 TripPlanner

    U->>C: 选定方案 ②
    C->>T: POST /travel/book {planNo=2}
    T->>DB: 校验金币/燃料/疲劳
    T->>DB: INSERT trip status=BOOKED
    T->>Res: 扣 coin/fuel
    T->>R: SADD trip:in_transit:{turn} {tripId}
    T-->>C: tripId
    C-->>U: 飞机就位动画

    Note over Sch: 每回合 cron 触发
    Sch->>T: advanceTrips(currentTurn)
    T->>R: SMEMBERS trip:in_transit:{turn}
    R-->>T: tripIds
    loop 每个 trip
        T->>Dice: roll(trip, currentTurn)
        Dice-->>T: TripEvent (or NONE)
        alt 有事件
            T->>DB: INSERT trip_event
            T->>MQ: publish trip-event
            MQ-->>C: WS push
            C-->>U: 弹路上事件小卡 (可选交互)
        end
        T->>DB: UPDATE trip 进度
        alt 已到达
            T->>DB: UPDATE status=ARRIVED
            T->>MQ: publish trip-arrived
            T->>Res: 结算路上发现的线索
        end
    end
```

---

## 6. 路上事件骰逻辑

```mermaid
flowchart TB
    Roll[d100] --> R{结果}
    R -- "1-25" --> N[NONE 平稳]
    R -- "26-50" --> C[CLUE_FOUND +1 Clue]
    R -- "51-70" --> M[MINOR_TROUBLE -10 coin]
    R -- "71-85" --> W[WEATHER_DELAY +1 turn]
    R -- "86-95" --> B[BANDIT 进入战斗]
    R -- "96-100" --> H[HIDDEN_QUEST 解锁支线]

    B --> Battle{战斗结果}
    Battle -- 胜 --> Loot[+50 coin]
    Battle -- 败 --> Dmg[队伍 HP -30]
    Battle -- 逃 --> Delay[+1 turn]
```

> 概率系数全部走 `Configuration.TRIP_EVENT_RATE_*`，可热刷新。

---

## 7. 接口契约 (OpenAPI 摘要)

```yaml
paths:
  /travel/plan:
    post:
      summary: 计算 3 套行程方案
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/TripPlanQuery' }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/TripPlanVO' }

  /travel/book:
    post:
      summary: 订票创建 Trip
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/TripBookQuery' }
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/TripVO' }

  /travel/trip/{tripId}/cancel:
    post:
      summary: 退票 (扣 30% 手续费)
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/TripRefundVO' }

  /travel/in-transit:
    post:
      summary: 我当前在途行程
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/TripInTransitQuery' }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/TripVO' }

  /travel/schedule:
    post:
      summary: 查路线班次
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/ScheduleQuery' }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/ScheduleVO' }

components:
  schemas:
    TripPlanQuery:
      type: object
      required: [fromCityId, toCityId, teamId]
      properties:
        fromCityId: { type: integer, format: int64 }
        toCityId: { type: integer, format: int64 }
        teamId: { type: integer, format: int64 }
        preference: { type: integer, enum: [1, 2, 3], description: '1快 2省 3稳' }
    TripPlanVO:
      type: object
      properties:
        planNo: { type: integer }
        vehicleChain:
          type: array
          items: { type: string }
        totalTurn: { type: integer }
        totalPrice: { type: integer }
        eventExpect: { type: integer }
        bonusDesc: { type: string }
    TripBookQuery:
      type: object
      required: [planNo, fromCityId, toCityId, teamId]
      properties:
        planNo: { type: integer }
        fromCityId: { type: integer, format: int64 }
        toCityId: { type: integer, format: int64 }
        teamId: { type: integer, format: int64 }
        missionId: { type: integer, format: int64 }
    TripVO:
      type: object
      properties:
        id: { type: integer, format: int64 }
        teamId: { type: integer, format: int64 }
        status: { type: string }
        startTurn: { type: integer }
        arriveTurn: { type: integer }
        progressPercent: { type: integer }
    TripRefundVO:
      type: object
      properties:
        refundCoin: { type: integer }
        feeCoin: { type: integer }
    TripInTransitQuery:
      type: object
      properties:
        playerId: { type: integer, format: int64 }
    ScheduleQuery:
      type: object
      properties:
        routeIds:
          type: array
          items: { type: integer, format: int64 }
    ScheduleVO:
      type: object
      properties:
        routeId: { type: integer, format: int64 }
        nextDepartTurn: { type: integer }
        turnInterval: { type: integer }
```

---

## 8. 前端组件树（出行专属）

```mermaid
graph TB
    UL[UILayer]
    UL --> Layer4["★ TravelMapLayer (第4视图)"]
    Layer4 --> RouteRender[RouteRender]
    RouteRender --> PlaneLine[PlanePathLine 黄虚]
    RouteRender --> ShipLine[ShipPathLine 蓝实]
    RouteRender --> TrainLine[TrainPathLine 棕点]
    Layer4 --> NodeBadge[CityHubBadge]

    UL --> Planner[★ TripPlannerCard 浮层]
    Planner --> FromTo[FromTo 选择条]
    Planner --> PlanRow[PlanRow x3]
    PlanRow --> RowMeta[载具/回合/价格/收益]
    Planner --> ResourceCost[ResourceCost 燃料/疲劳]
    Planner --> Confirm

    UL --> Clock[★ ScheduleClock 左下]
    Clock --> Hand[ClockHand 旋转]
    Clock --> Label[Next Flight T+2]

    UL --> TripLog[★ TripLogPanel 右下]
    TripLog --> LogRow

    UL --> EventDialog[★ TripEventDialog]
    EventDialog --> EventTitle
    EventDialog --> EventOptions

    UL --> Anim[VehicleSpriteAnim 地图上]
    Anim --> Bezier[BezierMover]
```

---

## 9. 性能优化

| 项 | 优化 |
|----|------|
| 路径预计算 | 启动时计算所有 Hub-Hub 最短路, Redis Hash 缓存 |
| 在途集合 | Redis Set `trip:in_transit:{turn}`, 避免每次扫表 |
| 班次查询 | `multiGet` 批量取多 routeId |
| WS 推送 | 路上事件按玩家 channel 推, 不广播 |
| 客户端动画 | `BezierMover` 用单 update 帧驱动, 减 GC |

---

## 10. 单测清单

### 后端

| 编号 | 用例 | 期望 |
|------|------|------|
| TR-T01 | `planTrip` 同城同节点 | 抛 BIZ_TRIP_SAME_CITY |
| TR-T02 | `planTrip` 不可达 | 抛 BIZ_TRIP_UNREACHABLE |
| TR-T03 | `planTrip` 3 套方案均不重复 | OK |
| TR-T04 | `planTrip` 偏好"快"-> totalTurn 最小 | OK |
| TR-T05 | `bookTrip` 余额不足 | 抛 BIZ_NOT_ENOUGH_COIN, 不创建 |
| TR-T06 | `bookTrip` 成功 -> 事务 commit | 资源扣减 + trip insert 同时成功 |
| TR-T07 | `cancelTrip` 在途不可退 | 抛 BIZ_TRIP_IN_TRANSIT |
| TR-T08 | `cancelTrip` BOOKED 退 70% | OK |
| TR-T09 | `advanceTrips` 到达终点 -> ARRIVED | OK |
| TR-T10 | `advanceTrips` 触发风暴事件 -> +1 turn | OK |
| TR-T11 | `Dice.roll` 1000 次 -> 概率分布吻合 ±5% | OK |

### 前端

| 编号 | 用例 | 期望 |
|------|------|------|
| FE-T31 | 点两节点 -> 自动弹 Planner | OK |
| FE-T32 | Hover 方案行 -> 地图预览路径高亮 | OK |
| FE-T33 | 余额不足 -> Confirm 灰色 | OK |
| FE-T34 | 收到 trip-event 推送 -> 弹小卡 | OK |
| FE-T35 | 飞机沿贝塞尔曲线动画 60fps | 帧率达标 |

---

## 11. 验收 Demo

```text
1. 切到 Travel Map -> 整张图变暗, 黄/蓝/棕三色航线点亮
2. 点 Aegis HQ -> 再点 Nova Base -> 弹规划器
3. 看到 3 套方案, 每套 hover 时地图对应路径闪烁
4. 选 ② -> 资源扣减动画 + 飞机/船图标在起点就位
5. 点 "End Turn" 推进 1 回合 -> 飞机沿曲线动到中点
6. 第 2 回合 -> 弹 "海上风暴, 延迟 1 回合" 事件
7. 第 4 回合 -> 抵达, Trip Log 加新行, 关联任务进度 +50%
8. 班次时钟同步显示 "Next Flight T+2"
```

---

## 12. 与 Java 规范对齐

- [x] `TripPlanQuery / TripBookQuery / TripInTransitQuery / ScheduleQuery` 全部实体接收
- [x] `TripPlanVO / TripVO / TripRefundVO / ScheduleVO` 返回带 Swagger
- [x] `bookTrip` `@Transactional` 保证扣资源+创建行程原子
- [x] `Configuration` 集中管理 `TRIP_EVENT_RATE_*`, `PLANE_PRICE_FACTOR`, `REFUND_FEE_RATE` 等
- [x] Redis `multiGet` 批量取班次/路径
- [x] `@Slf4j` 关键节点: 订票/在途事件/到达
- [x] 异常 catch 必须打 `log.error("Trip {} 路上结算异常:", tripId, e)`
- [x] `if/for` 强制大括号
