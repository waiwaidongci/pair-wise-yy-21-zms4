import { db } from "../src/db";
import { repairTicketService } from "../src/services/RepairTicketService";
import { crewService } from "../src/services/CrewService";
import { repairTicketRepository } from "../src/repositories/RepairTicketRepository";
import { crewRepository } from "../src/repositories/CrewRepository";
import { faultReportRepository } from "../src/repositories/FaultReportRepository";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
    throw new Error(msg);
  }
  console.log("PASS:", msg);
}

async function main() {
  // ---- 1. 回滚：资产写入失败时，工单与班组必须恢复原状态 ----
  const ticketId = 4; // WAIT_DISPATCH / EQUIPMENT_DAMAGE
  const crewId = 2; // 技能匹配、当值、无未结工单
  const ticketBefore = repairTicketRepository.findById(ticketId)!;
  const crewBefore = crewRepository.findById(crewId)!;
  assert(ticketBefore.status === "WAIT_DISPATCH", "前置：工单4 为 WAIT_DISPATCH");
  assert(crewBefore.current_ticket_id == null, "前置：班组2 无未结工单");

  const report = faultReportRepository.findById(Number(ticketBefore.fault_report_id))!;
  const originalAssetId = report.asset_id;
  report.asset_id = 9999; // 让资产写入失败

  let rolledBack = false;
  try {
    await repairTicketService.dispatch(ticketId, crewId, 1);
  } catch (err) {
    rolledBack = (err as { code?: string }).code === "ASSET_NOT_FOUND";
  }
  assert(rolledBack, "资产缺失时抛出 ASSET_NOT_FOUND");

  const ticketAfter = repairTicketRepository.findById(ticketId)!;
  const crewAfter = crewRepository.findById(crewId)!;
  assert(ticketAfter.status === "WAIT_DISPATCH", "回滚后工单4 恢复 WAIT_DISPATCH（未被派工）");
  assert(ticketAfter.team_id == null, "回滚后工单4 team_id 为空");
  assert(crewAfter.current_ticket_id == null, "回滚后班组2 未被占用");
  assert(crewAfter.duty_status === "ON_DUTY", "回滚后班组2 仍当值");

  report.asset_id = originalAssetId; // 还原测试夹具（回滚后需重新取活对象）
  faultReportRepository.findById(Number(ticketBefore.fault_report_id))!.asset_id = originalAssetId;

  // ---- 2. 候选失效重算：班组状态变化后候选随之变化 ----
  let candidates = crewService.candidatesForTicket(ticketId);
  assert(
    candidates.some((c) => c.id === crewId),
    "EQUIPMENT_DAMAGE 候选包含班组2"
  );

  crewService.setDutyStatus(crewId, "OFF_DUTY");
  candidates = crewService.candidatesForTicket(ticketId);
  assert(
    !candidates.some((c) => c.id === crewId),
    "班组2 离岗后候选不再包含它（候选已失效重算）"
  );

  crewService.setDutyStatus(crewId, "ON_DUTY");
  candidates = crewService.candidatesForTicket(ticketId);
  assert(
    candidates.some((c) => c.id === crewId),
    "班组2 复岗后候选重新包含它"
  );

  // ---- 3. 复电释放班组：工单 RESTORED 后班组可再接新单 ----
  // 先派工
  const result = await repairTicketService.dispatch(ticketId, crewId, 1);
  assert(result.ticket.status === "ASSIGNED", "派工后工单 ASSIGNED");
  assert(crewRepository.findById(crewId)!.current_ticket_id === ticketId, "派工后班组被占用");

  // 状态流转到 RESTORED
  repairTicketService.transitionStatus(ticketId, "ARRIVED");
  repairTicketService.transitionStatus(ticketId, "REPAIRING");
  repairTicketService.transitionStatus(ticketId, "RESTORED");
  assert(crewRepository.findById(crewId)!.current_ticket_id == null, "复电后班组被释放");

  console.log(process.exitCode ? "\nRESULT: FAILED" : "\nRESULT: ALL PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
