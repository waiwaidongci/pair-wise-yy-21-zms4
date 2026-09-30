# 电力配网抢修工单系统（grid-repair）

面向供电所的配网故障报修、**抢修派工台**、备件领用和停电恢复跟踪平台。调度员可在派工台上查看待派工单、按「技能匹配 + 当值 + 无未结工单」筛选候选抢修班组、完成派工与复电确认；两位调度员并发保存时只有一笔成立，落败方自动看到冲突工单并重算候选。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

启动后：

- 前端：<http://localhost:20104>
- 后端健康检查：<http://localhost:21104/health>
- 审计日志：<http://localhost:21104/api/audit-logs>

## 访问地址或 CLI 示例

### 查看工单 101 的候选班组

```bash
curl http://localhost:21104/api/repair-ticket/101/dispatch-candidates
```

返回中 `eligible=true` 的班组同时满足：技能命中故障类型、`duty_status=ON_DUTY`、`current_ticket_id` 为空（且工单台账中无未结工单）；被排除的班组带 `reject_reason`（`SKILL_NOT_MATCHED` / `NOT_ON_DUTY` / `CREW_BUSY`）。

### 派工（携带候选版本号，乐观锁）

```bash
curl -X POST http://localhost:21104/api/repair-ticket/101/dispatch \
  -H 'Content-Type: application/json' \
  -H 'x-dispatcher-id: 1' -H 'x-dispatcher-name: 张调度' \
  -d '{"ticketId":101,"crewId":1,"ticketVersion":1,"crewVersion":1}'
```

并发落败方收到 `409 DISPATCH_VERSION_CONFLICT`，响应体 `details` 内直接带回**冲突工单最新状态 + 重新计算的候选班组**，前端用它替换视图，无需手动刷新。

### 复电确认（到场/抢修/复电/归档）

```bash
curl -X POST http://localhost:21104/api/repair-ticket/101/transition \
  -H 'Content-Type: application/json' \
  -d '{"version":2,"action":"RESTORE"}'
```

复电会联动：班组 `current_ticket_id` 释放、配网资产健康状态回落 `WATCH`、报修单置 `RESTORED`。

### 写入失败回滚演练

加请求头 `x-simulate-write-failure: afterTicket|afterCrew`，可模拟「工单已写 / 班组已占用后」第三处写入失败，服务端整体回滚，返回 `500 DISPATCH_WRITE_FAILED`，不会留下班组被占用却工单未派出的半成功状态。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`（端口 20104，`/api` 代理到 `http://localhost:21104`）
- 后端：`cd backend && npm install && npm run dev`，默认 3000；本地对齐编排端口可 `PORT=21104 npm run dev`
- 接口统一挂在 `/api`；当前数据保存在后端进程内的版本化存储（种子来自 `backend/src/seed.ts`，MySQL 表结构与种子见 `database/init.sql`），重启进程即重置，适合演示并发与回滚。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Pinia（自定义控件 + CSS，统一走 `/api`） |
| 后端 | Node.js + Express + TypeScript（分层：route/controller/service/repository/model/DTO 构造器） |
| 数据库 | MySQL 8.0（`init.sql` 建表 + 种子，业务表带 `version` 乐观锁列） |
| 认证/RBAC | JWT 网关注入身份头 + `authMiddleware` / `rbacMiddleware`（派工写操作限 DISPATCHER/ADMIN） |
| 部署 | Docker Compose（frontend / backend / db 三服务，命名卷） |

## 派工台设计要点

1. **候选三条件**：技能匹配（`FaultTypeSkillMap`：故障类型 → 技能集合，命中其一即可）、班组 `ON_DUTY`、班组无未结工单（`current_ticket_id` 为空且工单台账无 ASSIGNED/ARRIVED/REPAIRING 工单）。
2. **并发只允许一笔成立**：工单与班组记录都带 `version`；派工在进程内串行写锁（`utils/writeLock.ts`）的临界区内完成「版本比对 + 三实体写入」。版本不匹配或工单已离开 `WAIT_DISPATCH` 即返回 409，并在 `details` 中带回冲突工单与重算候选。
3. **三实体同写、失败回滚**：一次派工同时写 抢修工单（ASSIGNED）、抢修班组（占用 current_ticket_id）、配网资产（健康状态联动，另同步报修单状态）。写入前对四张表打快照，任一步失败（含注入故障）整快照恢复。
4. **候选随状态失效重算**：候选不做跨请求缓存；工单状态流转、班组当值切换都会推进版本，前端收到 409 或操作完成后用响应体重算并替换视图。

### 主要接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/repair-ticket/:ticketId/dispatch-candidates` | 待派工单视图（工单+报修+资产）与候选班组 |
| POST | `/api/repair-ticket/:ticketId/dispatch` | 派工保存（乐观锁，409 带回冲突工单+候选） |
| POST | `/api/repair-ticket/:ticketId/transition` | ARRIVE / REPAIR / RESTORE / CLOSE 状态流转 |
| POST | `/api/crew/:crewId/duty` | 班组上/下班（版本变化导致候选失效） |
| GET | `/api/audit-logs` | 派工、占用、释放、复电、当值切换审计日志 |

## 项目目录结构

```text
frontend/src/
├── api/                  # http 封装（409 冲突体解析）+ 按实体的请求模块 + Dispatch
├── stores/               # DispatchStore（候选/冲突/重算）与各实体 store
├── types/                # RepairTicket/Crew/GridAsset/Dispatch 等
├── constants/            # TicketStatus/FaultType/SkillTag/Priority/错误码/日志模板/状态文案
├── constructors/         # 各实体默认对象构造器 + DispatchConstructor
├── components/common/    # StatusBadge/PriorityTag/CrewCard/TimelineList/StatCard/EmptyState
├── components/dispatch/  # PendingTicketQueue/CandidatePanel/ConflictBanner/DispatchTicketPanel
├── hooks/                # useTicketFlow/useCrewAvailability/useDispatcherIdentity/usePagination
├── pages/                # Dashboard/Assets/Faults/Tickets(派工台)/Parts
├── router/ utils/ mocks/
backend/src/
├── routes/ controllers/ services/ repositories/ models/
├── services/DispatchService.ts            # 派工/流转：写锁+乐观锁+快照回滚
├── services/dispatchCandidateService.ts   # 候选三条件领域逻辑
├── repositories/store.ts                  # 版本化内存表 + 事务快照/回滚
├── utils/writeLock.ts                     # 串行写锁
├── middlewares/                          # auth/rbac/auditLog/rateLimit/errorHandler
├── constants/ constructors/ types/ utils/ config/
database/init.sql                         # MySQL 建表（含 version 列）与种子
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`：Compose 项目名，默认 `grid-repair`
- `FRONTEND_PORT`：前端端口，默认 `20104`
- `BACKEND_PORT`：后端端口，默认 `21104`（容器内 3000）
- `DB_PORT`：MySQL 宿主机端口，默认 `33060`
- `DB_NAME / DB_USER / DB_PASSWORD`：数据库凭据
- `JWT_SECRET`：JWT 密钥

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: grid-repair`，容器名均带 `${COMPOSE_PROJECT_NAME:-grid-repair}` 前缀。
- 数据库使用命名卷 `db_data`，不绑定挂载到中文路径；`db` 配 healthcheck，`backend` 通过 `depends_on: condition: service_healthy` 等待，`frontend` 等待后端健康。
- 前端 Nginx 把 `/api/` 反代到 `http://backend:3000/`，SPA 路由使用 `try_files $uri $uri/ /index.html;`。
- 常见问题：端口占用改 `.env` 后 `docker compose up -d`；重置数据 `docker compose down -v`；想重复演示并发/回滚，重启 backend 容器即可恢复种子。

## 枚举/常量出现位置清单

每个枚举都在前后端重复定义，并贯穿类型、构造器、日志模板、错误消息、筛选/候选计算与展示组件。

### FaultType（OUTAGE / VOLTAGE_LOW / TRIP / EQUIPMENT_DAMAGE / SAFETY_RISK）

- 后端：`backend/src/constants/FaultType.ts`、`models/FaultReport.ts`、`constants/SkillTag.ts`（FaultTypeSkillMap 技能映射）、`services/dispatchCandidateService.ts`、`seed.ts`、`constructors/FaultReportDtoFactory.ts`、`database/init.sql`
- 前端：`frontend/src/constants/FaultType.ts`、`types/FaultType.ts`、`constants/SkillTag.ts`、`utils/formatters.ts`（formatFaultType）、`components/dispatch/DispatchTicketPanel.vue`、`pages/FaultsPage.vue`、`mocks/seedData.ts`

### TicketStatus（WAIT_DISPATCH / ASSIGNED / ARRIVED / REPAIRING / RESTORED / CLOSED）

- 后端：`constants/TicketStatus.ts`（含 TicketStatusFlow、OpenTicketStatuses）、`models/RepairTicket.ts`、`services/DispatchService.ts`、`services/dispatchCandidateService.ts`、`repositories/RepairTicketRepository.ts`、`constants/logTemplates.ts`、`constants/errorMessages.ts`、`controllers/DispatchController.ts`、`seed.ts`、`init.sql`
- 前端：`constants/TicketStatus.ts`（含状态机映射）、`types/TicketStatus.ts`、`types/RepairTicket.ts`、`hooks/useTicketFlow.ts`、`stores/RepairTicketStore.ts`、`stores/DispatchStore.ts`、`components/common/StatusBadge.vue`、`components/common/TimelineList.vue`、`constants/statusText.ts`、`utils/formatters.ts`、派工台全部页面/组件

### AssetHealthStatus（NORMAL / WATCH / DEGRADED / DANGEROUS）

- 后端：`constants/AssetHealthStatus.ts`、`models/GridAsset.ts`、`services/DispatchService.ts`（派工置 DEGRADED、复电回落 WATCH）、`seed.ts`、`init.sql`
- 前端：`constants/AssetHealthStatus.ts`、`types/AssetHealthStatus.ts`、`components/common/StatusBadge.vue`、`components/dispatch/DispatchTicketPanel.vue`、`pages/AssetsPage.vue`、`utils/formatters.ts`、`mocks/seedData.ts`

### 新增枚举（本次派工台）

- `SkillTag` + `FaultTypeSkillMap`：前后端各一份，是候选匹配与 CrewCard 技能展示的唯一口径。
- `DutyStatus`（ON_DUTY/OFF_DUTY）、`Priority`（NORMAL/HIGH/URGENT）：同样贯穿类型、常量文案、store 排序、徽章组件、种子与建表 SQL。

## 为什么会牵一发动全身

- 派工一个动作横跨 **抢修工单 / 抢修班组 / 配网资产 / 故障报修** 四类数据，任何字段或状态机调整都会触及 DTO 构造器、repository、service、controller、前端 store/api/类型/组件。
- 错误码与消息在 `constants/errorCodes`、`constants/errorMessages` 双端各一份，service 抛 `BusinessError`、controller 再包 `ControllerError`、全局中间件兜底，新增错误码必须三处同步。
- 日志模板集中在双端 `constants/logTemplates`，派工/复电/当值切换经 `utils/auditLogger` 写 `audit_log`，改字段必须改模板和调用处。
- 乐观锁版本号同时存在于 SQL 表、内存存储、DTO、前端类型与派工请求体；候选计算在前后端各有一份同口径镜像（`dispatchCandidateService` 与 `useCrewAvailability`），调整匹配规则需两端同步。

## License

MIT
