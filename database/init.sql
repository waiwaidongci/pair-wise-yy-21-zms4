-- 电力配网抢修工单系统 初始化表结构
-- 业务写表带 version 乐观锁：两位调度员同时派工时只有一笔成立。

CREATE TABLE IF NOT EXISTS grid_asset (
  id INTEGER PRIMARY KEY,
  asset_code VARCHAR(64),
  asset_type VARCHAR(32),
  feeder_line VARCHAR(128),
  voltage_level VARCHAR(16),
  location_desc VARCHAR(255),
  health_status VARCHAR(32),
  owner_team_id INTEGER NULL,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS fault_report (
  id INTEGER PRIMARY KEY,
  reporter_name VARCHAR(64),
  phone VARCHAR(32),
  asset_id INTEGER,
  fault_type VARCHAR(32),
  address_desc VARCHAR(255),
  severity VARCHAR(16),
  report_channel VARCHAR(32),
  status VARCHAR(32),
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS repair_ticket (
  id INTEGER PRIMARY KEY,
  fault_report_id INTEGER,
  team_id INTEGER NULL,
  dispatcher_id INTEGER NULL,
  priority VARCHAR(16),
  status VARCHAR(32),
  assigned_at VARCHAR(40) NULL,
  restored_at VARCHAR(40) NULL,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS crew (
  id INTEGER PRIMARY KEY,
  name VARCHAR(64),
  leader_id INTEGER,
  skill_tags VARCHAR(255),
  duty_status VARCHAR(16),
  current_ticket_id INTEGER NULL,
  contact_phone VARCHAR(32),
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS spare_part_usage (
  id INTEGER PRIMARY KEY,
  ticket_id INTEGER,
  part_code VARCHAR(64),
  part_name VARCHAR(128),
  quantity INTEGER,
  warehouse_name VARCHAR(128),
  approved_by VARCHAR(64),
  usage_status VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  actor VARCHAR(64),
  action VARCHAR(64),
  target_type VARCHAR(32),
  target_id VARCHAR(32),
  detail VARCHAR(500),
  created_at VARCHAR(40)
);

-- 种子数据（与 backend/src/seed.ts 保持一致）
INSERT INTO grid_asset (id, asset_code, asset_type, feeder_line, voltage_level, location_desc, health_status, owner_team_id)
VALUES
  (1, 'PD-10kV-001', 'LINE', '10kV 滨海线 F01', '10kV', '滨海大道与港兴路交叉口环网柜', 'DEGRADED', 1),
  (2, 'PD-TX-014', 'TRANSFORMER', '10kV 滨海线 F01', '10kV', '港兴新村 2 号配电房 1 号变', 'WATCH', 2),
  (3, 'PD-CB-207', 'CABLE_BRANCH_BOX', '10kV 云山路 F07', '10kV', '云山路 48 号门前电缆分支箱', 'DANGEROUS', 1),
  (4, 'PD-LP-331', 'LINE', '10kV 云山路 F07', '10kV', '云山公园西侧架空线 12 号杆', 'NORMAL', 3),
  (5, 'PD-TX-058', 'TRANSFORMER', '10kV 临港线 F12', '10kV', '临港工业园北区 5 号箱变', 'DEGRADED', 4),
  (6, 'PD-CB-412', 'CABLE_BRANCH_BOX', '10kV 老城区线 F03', '10kV', '老城厢文化街南口分支箱', 'WATCH', 6);

INSERT INTO fault_report (id, reporter_name, phone, asset_id, fault_type, address_desc, severity, report_channel, status)
VALUES
  (1, '王建国', '13800138001', 1, 'OUTAGE', '滨海大道港兴路周边整片停电', 'URGENT', 'HOTLINE', 'PENDING'),
  (2, '李秀兰', '13800138002', 2, 'VOLTAGE_LOW', '港兴新村 1-3 栋电压偏低、空调无法启动', 'HIGH', 'APP', 'PENDING'),
  (3, '陈志强', '13800138003', 3, 'EQUIPMENT_DAMAGE', '云山路电缆分支箱有焦糊味、外壳发烫', 'URGENT', 'GRID_INSPECTOR', 'PENDING'),
  (4, '赵敏', '13800138004', 4, 'TRIP', '云山公园西侧线路跳闸重合不成', 'NORMAL', 'HOTLINE', 'PENDING'),
  (5, '孙立军', '13800138005', 5, 'SAFETY_RISK', '临港工业园箱变围栏倾斜、带电部位外露', 'HIGH', 'GRID_INSPECTOR', 'PROCESSING'),
  (6, '周文华', '13800138006', 6, 'OUTAGE', '老城厢文化街夜间短时停电后已恢复', 'NORMAL', 'WECHAT', 'RESTORED');

INSERT INTO repair_ticket (id, fault_report_id, team_id, dispatcher_id, priority, status, assigned_at, restored_at)
VALUES
  (101, 1, NULL, NULL, 'URGENT', 'WAIT_DISPATCH', NULL, NULL),
  (102, 2, NULL, NULL, 'HIGH', 'WAIT_DISPATCH', NULL, NULL),
  (103, 3, NULL, NULL, 'URGENT', 'WAIT_DISPATCH', NULL, NULL),
  (104, 4, NULL, NULL, 'NORMAL', 'WAIT_DISPATCH', NULL, NULL),
  (105, 5, 5, 1, 'HIGH', 'REPAIRING', '2026-09-30T01:20:00.000Z', NULL),
  (106, 6, 6, 2, 'NORMAL', 'RESTORED', '2026-09-29T14:05:00.000Z', '2026-09-29T16:40:00.000Z');

INSERT INTO crew (id, name, leader_id, skill_tags, duty_status, current_ticket_id, contact_phone)
VALUES
  (1, '配电抢修甲班', 11, 'OUTAGE_REPAIR,LINE_WORK,EMERGENCY_RESCUE', 'ON_DUTY', NULL, '13900000001'),
  (2, '配电抢修乙班', 12, 'TRANSFORMER_REPAIR,OUTAGE_REPAIR,METERING_REPAIR', 'ON_DUTY', NULL, '13900000002'),
  (3, '线路抢修丙班', 13, 'LINE_WORK,CABLE_REPAIR', 'ON_DUTY', NULL, '13900000003'),
  (4, '电缆抢修丁班', 14, 'CABLE_REPAIR,TRANSFORMER_REPAIR,EMERGENCY_RESCUE', 'OFF_DUTY', NULL, '13900000004'),
  (5, '应急抢修戊班', 15, 'EMERGENCY_RESCUE,OUTAGE_REPAIR', 'ON_DUTY', 105, '13900000005'),
  (6, '抢修预备队', 16, 'OUTAGE_REPAIR,LINE_WORK,TRANSFORMER_REPAIR,CABLE_REPAIR,EMERGENCY_RESCUE', 'ON_DUTY', NULL, '13900000006');

INSERT INTO spare_part_usage (id, ticket_id, part_code, part_name, quantity, warehouse_name, approved_by, usage_status)
VALUES
  (1, 105, 'SP-FENCE-02', '箱变围栏组件', 4, '临港仓库', '仓管-钱库', 'CONSUMED'),
  (2, 106, 'SP-FUSE-630', '跌落式熔断器 630A', 2, '城区中心库', '仓管-钱库', 'CONSUMED');
