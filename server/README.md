# map-game-server · 后端服务

> 小小特工 · 出行特工版 · Spring Boot 3 后端脚手架

## 技术栈

- JDK 17 + Spring Boot 3.2.5
- MyBatis-Plus 3.5.5
- Springdoc OpenAPI 2.3.0（替代 Swagger 2，使用 `@Schema` 等价 `@ApiModelProperty`）
- Aviator 5（事件 DSL 引擎）
- Hutool 5.8（工具）
- MySQL 8 / Redis 7 / RabbitMQ 3
- Lombok

## 工程结构

```text
server/
├── pom.xml
├── docker-compose.yml                 # 本地一键起 MySQL+Redis+RabbitMQ
└── src/main/
    ├── java/com/mapgame/
    │   ├── MapGameApplication.java    # 启动入口
    │   ├── common/
    │   │   ├── api/                   # Result / ResultCode 统一返回
    │   │   ├── config/                # Configuration / OpenApi / MybatisPlus / Cors / Redis
    │   │   └── exception/             # BizException / GlobalExceptionHandler
    │   └── modules/
    │       └── world/                 # S1 World 模块完整范例
    │           ├── controller/
    │           ├── service/
    │           ├── mapper/
    │           ├── entity/
    │           ├── query/             # 严禁 Map 接收参数
    │           ├── vo/                # 严禁 Map 返回
    │           └── enums/
    └── resources/
        ├── application.yml
        ├── application-dev.yml
        └── db/migration/
            ├── V1__init_world.sql           # S1 世界/大陆/城市
            ├── V2__init_agent_team.sql      # S2 玩家/特工/队伍
            ├── V3__init_mission.sql         # S3 任务模板/进度/日志
            ├── V4__init_travel.sql          # S4 路径/班次/行程/事件 ★
            ├── V5__init_build_research.sql  # S5 建筑/科技16节点/兵种/贸易
            └── V6__init_event_balance.sql   # S6 事件模板 + 30项数值平衡
```

## 团队 Java 规范对齐

- ✅ 接口参数全部 `XxxQuery` 实体接收（无 Map）
- ✅ 接口返回全部 `XxxVO`（带 `@Schema` 等价 `@ApiModelProperty`）
- ✅ 类头注释含 `@author make java` + `@since 日期`
- ✅ 实体类强制 `@Data`
- ✅ 所有 Service/Controller 加 `@Slf4j`
- ✅ 所有配置项集中在 `Configuration` 静态字段，业务代码不直接 `@Value`
- ✅ if/for 强制大括号
- ✅ 异常 catch 必须打日志（GlobalExceptionHandler 已统一处理）
- ✅ 多 key Redis 操作走 `multiGet`（后续 S4/S5 模块会用到）

## 本地启动

### 1. 启动中间件

```bash
cd server
docker compose up -d
```

启动后会自动执行 `db/migration/V1__init_world.sql` 初始化数据库和种子数据。

### 2. 启动应用

```bash
mvn spring-boot:run
# 或
mvn package -DskipTests
java -jar target/map-game-server.jar
```

### 3. 验证

```bash
# 健康检查
curl http://localhost:8080/api/world/1

# 列出大陆 + 城市
curl http://localhost:8080/api/world/1/regions

# Swagger UI
浏览器打开: http://localhost:8080/api/swagger-ui.html
```

预期返回：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": 1,
    "name": "Default Save",
    "turnNo": 1
  }
}
```

## API 一览（已实现 / 待实现）

| 模块 | 接口 | 状态 |
|------|------|------|
| S1 World | `GET /world/{id}` | ✅ |
| S1 World | `GET /world/{id}/regions` | ✅ |
| S1 World | `POST /world/view` | ✅ |
| S2 Agent/Team | `/agent/*` `/team/*` | ⬜ 待实现 |
| S3 Mission | `/mission/*` | ⬜ 待实现 |
| S4 Travel ★ | `/travel/*` | ⬜ 待实现 |
| S5 Build/Research | `/build/*` `/research/*` | ⬜ 待实现 |
| S6 Event/Balance | `/event/*` `/balance/*` | ⬜ 待实现 |

## 后续

- 🅱 前端 Cocos Creator 脚手架
- 🅲 S2-S6 模块全量 DDL + 种子数据
- 🅳 S4 出行可玩 Demo 集成
