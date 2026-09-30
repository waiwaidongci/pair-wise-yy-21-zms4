import type { GridAsset } from "./models/GridAsset";
import type { FaultReport } from "./models/FaultReport";
import type { RepairTicket } from "./models/RepairTicket";
import type { Crew } from "./models/Crew";
import type { SparePartUsage } from "./models/SparePartUsage";

/**
 * 本地种子数据（配网抢修真实业务形态）：
 * - 6 个班组：甲/乙/丙班当值空闲，丁班休息，戊班当值但持有未结工单，预备队当值空闲（全能）
 * - 6 张工单：4 张待派（WAIT_DISPATCH），其余覆盖到场/抢修中/已复电
 * - 技能匹配见 constants/SkillTag 的 FaultTypeSkillMap
 */
export const seed: {
  gridAsset: GridAsset[];
  faultReport: FaultReport[];
  repairTicket: RepairTicket[];
  crew: Crew[];
  sparePartUsage: SparePartUsage[];
} = {
  gridAsset: [
    {
      id: 1,
      asset_code: "PD-10kV-001",
      asset_type: "LINE",
      feeder_line: "10kV 滨海线 F01",
      voltage_level: "10kV",
      location_desc: "滨海大道与港兴路交叉口环网柜",
      health_status: "DEGRADED",
      owner_team_id: 1
    },
    {
      id: 2,
      asset_code: "PD-TX-014",
      asset_type: "TRANSFORMER",
      feeder_line: "10kV 滨海线 F01",
      voltage_level: "10kV",
      location_desc: "港兴新村 2 号配电房 1 号变",
      health_status: "WATCH",
      owner_team_id: 2
    },
    {
      id: 3,
      asset_code: "PD-CB-207",
      asset_type: "CABLE_BRANCH_BOX",
      feeder_line: "10kV 云山路 F07",
      voltage_level: "10kV",
      location_desc: "云山路 48 号门前电缆分支箱",
      health_status: "DANGEROUS",
      owner_team_id: 1
    },
    {
      id: 4,
      asset_code: "PD-LP-331",
      asset_type: "LINE",
      feeder_line: "10kV 云山路 F07",
      voltage_level: "10kV",
      location_desc: "云山公园西侧架空线 12 号杆",
      health_status: "NORMAL",
      owner_team_id: 3
    },
    {
      id: 5,
      asset_code: "PD-TX-058",
      asset_type: "TRANSFORMER",
      feeder_line: "10kV 临港线 F12",
      voltage_level: "10kV",
      location_desc: "临港工业园北区 5 号箱变",
      health_status: "DEGRADED",
      owner_team_id: 4
    },
    {
      id: 6,
      asset_code: "PD-CB-412",
      asset_type: "CABLE_BRANCH_BOX",
      feeder_line: "10kV 老城区线 F03",
      voltage_level: "10kV",
      location_desc: "老城厢文化街南口分支箱",
      health_status: "WATCH",
      owner_team_id: 6
    }
  ],
  faultReport: [
    {
      id: 1,
      reporter_name: "王建国",
      phone: "13800138001",
      asset_id: 1,
      fault_type: "OUTAGE",
      address_desc: "滨海大道港兴路周边整片停电",
      severity: "URGENT",
      report_channel: "HOTLINE",
      status: "PENDING"
    },
    {
      id: 2,
      reporter_name: "李秀兰",
      phone: "13800138002",
      asset_id: 2,
      fault_type: "VOLTAGE_LOW",
      address_desc: "港兴新村 1-3 栋电压偏低、空调无法启动",
      severity: "HIGH",
      report_channel: "APP",
      status: "PENDING"
    },
    {
      id: 3,
      reporter_name: "陈志强",
      phone: "13800138003",
      asset_id: 3,
      fault_type: "EQUIPMENT_DAMAGE",
      address_desc: "云山路电缆分支箱有焦糊味、外壳发烫",
      severity: "URGENT",
      report_channel: "GRID_INSPECTOR",
      status: "PENDING"
    },
    {
      id: 4,
      reporter_name: "赵敏",
      phone: "13800138004",
      asset_id: 4,
      fault_type: "TRIP",
      address_desc: "云山公园西侧线路跳闸重合不成",
      severity: "NORMAL",
      report_channel: "HOTLINE",
      status: "PENDING"
    },
    {
      id: 5,
      reporter_name: "孙立军",
      phone: "13800138005",
      asset_id: 5,
      fault_type: "SAFETY_RISK",
      address_desc: "临港工业园箱变围栏倾斜、带电部位外露",
      severity: "HIGH",
      report_channel: "GRID_INSPECTOR",
      status: "PROCESSING"
    },
    {
      id: 6,
      reporter_name: "周文华",
      phone: "13800138006",
      asset_id: 6,
      fault_type: "OUTAGE",
      address_desc: "老城厢文化街夜间短时停电后已恢复",
      severity: "NORMAL",
      report_channel: "WECHAT",
      status: "RESTORED"
    }
  ],
  repairTicket: [
    {
      id: 101,
      fault_report_id: 1,
      team_id: null,
      dispatcher_id: null,
      priority: "URGENT",
      status: "WAIT_DISPATCH",
      assigned_at: null,
      restored_at: null
    },
    {
      id: 102,
      fault_report_id: 2,
      team_id: null,
      dispatcher_id: null,
      priority: "HIGH",
      status: "WAIT_DISPATCH",
      assigned_at: null,
      restored_at: null
    },
    {
      id: 103,
      fault_report_id: 3,
      team_id: null,
      dispatcher_id: null,
      priority: "URGENT",
      status: "WAIT_DISPATCH",
      assigned_at: null,
      restored_at: null
    },
    {
      id: 104,
      fault_report_id: 4,
      team_id: null,
      dispatcher_id: null,
      priority: "NORMAL",
      status: "WAIT_DISPATCH",
      assigned_at: null,
      restored_at: null
    },
    {
      id: 105,
      fault_report_id: 5,
      team_id: 5,
      dispatcher_id: 1,
      priority: "HIGH",
      status: "REPAIRING",
      assigned_at: "2026-09-30T01:20:00.000Z",
      restored_at: null
    },
    {
      id: 106,
      fault_report_id: 6,
      team_id: 6,
      dispatcher_id: 2,
      priority: "NORMAL",
      status: "RESTORED",
      assigned_at: "2026-09-29T14:05:00.000Z",
      restored_at: "2026-09-29T16:40:00.000Z"
    }
  ],
  crew: [
    {
      id: 1,
      name: "配电抢修甲班",
      leader_id: 11,
      skill_tags: "OUTAGE_REPAIR,LINE_WORK,EMERGENCY_RESCUE",
      duty_status: "ON_DUTY",
      current_ticket_id: null,
      contact_phone: "13900000001"
    },
    {
      id: 2,
      name: "配电抢修乙班",
      leader_id: 12,
      skill_tags: "TRANSFORMER_REPAIR,OUTAGE_REPAIR,METERING_REPAIR",
      duty_status: "ON_DUTY",
      current_ticket_id: null,
      contact_phone: "13900000002"
    },
    {
      id: 3,
      name: "线路抢修丙班",
      leader_id: 13,
      skill_tags: "LINE_WORK,CABLE_REPAIR",
      duty_status: "ON_DUTY",
      current_ticket_id: null,
      contact_phone: "13900000003"
    },
    {
      id: 4,
      name: "电缆抢修丁班",
      leader_id: 14,
      skill_tags: "CABLE_REPAIR,TRANSFORMER_REPAIR,EMERGENCY_RESCUE",
      duty_status: "OFF_DUTY",
      current_ticket_id: null,
      contact_phone: "13900000004"
    },
    {
      id: 5,
      name: "应急抢修戊班",
      leader_id: 15,
      skill_tags: "EMERGENCY_RESCUE,OUTAGE_REPAIR",
      duty_status: "ON_DUTY",
      current_ticket_id: 105,
      contact_phone: "13900000005"
    },
    {
      id: 6,
      name: "抢修预备队",
      leader_id: 16,
      skill_tags: "OUTAGE_REPAIR,LINE_WORK,TRANSFORMER_REPAIR,CABLE_REPAIR,EMERGENCY_RESCUE",
      duty_status: "ON_DUTY",
      current_ticket_id: null,
      contact_phone: "13900000006"
    }
  ],
  sparePartUsage: [
    {
      id: 1,
      ticket_id: 105,
      part_code: "SP-FENCE-02",
      part_name: "箱变围栏组件",
      quantity: 4,
      warehouse_name: "临港仓库",
      approved_by: "仓管-钱库",
      usage_status: "CONSUMED"
    },
    {
      id: 2,
      ticket_id: 106,
      part_code: "SP-FUSE-630",
      part_name: "跌落式熔断器 630A",
      quantity: 2,
      warehouse_name: "城区中心库",
      approved_by: "仓管-钱库",
      usage_status: "CONSUMED"
    }
  ]
};
