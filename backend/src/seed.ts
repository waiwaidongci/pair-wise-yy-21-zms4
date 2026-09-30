import type { Database } from "./db";

export const seed: Database = {
  crews: [
    { id: 1, name: "抢修一班", leader_id: 101, skill_tags: "OUTAGE,TRIP", duty_status: "ON_DUTY", current_ticket_id: null, contact_phone: "13900000001" },
    { id: 2, name: "抢修二班", leader_id: 102, skill_tags: "EQUIPMENT_DAMAGE,SAFETY_RISK", duty_status: "ON_DUTY", current_ticket_id: null, contact_phone: "13900000002" },
    { id: 3, name: "抢修三班", leader_id: 103, skill_tags: "OUTAGE,VOLTAGE_LOW", duty_status: "ON_DUTY", current_ticket_id: null, contact_phone: "13900000003" },
    { id: 4, name: "抢修四班", leader_id: 104, skill_tags: "TRIP,EQUIPMENT_DAMAGE", duty_status: "OFF_DUTY", current_ticket_id: null, contact_phone: "13900000004" },
    { id: 5, name: "抢修五班", leader_id: 105, skill_tags: "OUTAGE,SAFETY_RISK", duty_status: "ON_DUTY", current_ticket_id: 2, contact_phone: "13900000005" }
  ],
  gridAssets: [
    { id: 1, asset_code: "GA-TRANS-001", asset_type: "TRANSFORMER", feeder_line: "城东线", voltage_level: "10kV", location_desc: "建设路12号配电室", health_status: "NORMAL", owner_team_id: 1 },
    { id: 2, asset_code: "GA-FEED-002", asset_type: "FEEDER", feeder_line: "城东线", voltage_level: "10kV", location_desc: "城东线3号杆", health_status: "WATCH", owner_team_id: 2 },
    { id: 3, asset_code: "GA-CABLE-003", asset_type: "CABLE", feeder_line: "滨河线", voltage_level: "10kV", location_desc: "滨河路8号电缆分接箱", health_status: "DEGRADED", owner_team_id: 3 },
    { id: 4, asset_code: "GA-METER-004", asset_type: "METER_BOX", feeder_line: "建设路", voltage_level: "220V", location_desc: "建设路表箱群", health_status: "NORMAL", owner_team_id: 4 },
    { id: 5, asset_code: "GA-RING-005", asset_type: "RING_MAIN_UNIT", feeder_line: "工业园线", voltage_level: "10kV", location_desc: "工业园区环网柜", health_status: "DANGEROUS", owner_team_id: 5 }
  ],
  faultReports: [
    { id: 1, reporter_name: "刘芳", phone: "13800001001", asset_id: 1, fault_type: "OUTAGE", address_desc: "建设路12号停电", severity: "HIGH", report_channel: "PHONE", status: "WAIT_DISPATCH" },
    { id: 2, reporter_name: "陈静", phone: "13800001002", asset_id: 2, fault_type: "TRIP", address_desc: "城东线3号杆跳闸", severity: "MEDIUM", report_channel: "APP", status: "WAIT_DISPATCH" },
    { id: 3, reporter_name: "赵磊", phone: "13800001003", asset_id: 3, fault_type: "EQUIPMENT_DAMAGE", address_desc: "滨河路8号电缆破损", severity: "CRITICAL", report_channel: "WECHAT", status: "WAIT_DISPATCH" },
    { id: 4, reporter_name: "孙丽", phone: "13800001004", asset_id: 4, fault_type: "VOLTAGE_LOW", address_desc: "建设路电压低", severity: "LOW", report_channel: "PHONE", status: "REPORTED" },
    { id: 5, reporter_name: "周强", phone: "13800001005", asset_id: 5, fault_type: "SAFETY_RISK", address_desc: "工业园环网柜异响", severity: "HIGH", report_channel: "APP", status: "DISPATCHED" }
  ],
  repairTickets: [
    { id: 1, fault_report_id: 1, team_id: null, dispatcher_id: null, priority: "HIGH", status: "WAIT_DISPATCH", assigned_at: null, restored_at: null },
    { id: 2, fault_report_id: 5, team_id: 5, dispatcher_id: 1, priority: "URGENT", status: "REPAIRING", assigned_at: "2026-09-29T09:00:00Z", restored_at: null },
    { id: 3, fault_report_id: 2, team_id: null, dispatcher_id: null, priority: "NORMAL", status: "WAIT_DISPATCH", assigned_at: null, restored_at: null },
    { id: 4, fault_report_id: 3, team_id: null, dispatcher_id: null, priority: "URGENT", status: "WAIT_DISPATCH", assigned_at: null, restored_at: null }
  ],
  sparePartUsages: [
    { id: 1, ticket_id: 2, part_code: "SP-CABLE-10", part_name: "10kV电缆终端头", quantity: 2, warehouse_name: "城东仓库", approved_by: "仓管-吴敏", usage_status: "APPROVED" },
    { id: 2, ticket_id: 2, part_code: "SP-FUSE-30", part_name: "跌落式熔断器", quantity: 3, warehouse_name: "城东仓库", approved_by: "仓管-吴敏", usage_status: "CONSUMED" }
  ],
  auditLogs: []
};
