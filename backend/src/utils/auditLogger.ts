import { getState, nextAuditLogId } from "../repositories/store";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { toAuditTarget } from "./formatters";

type RepairTicketTemplate = (typeof LOG_TEMPLATES.RepairTicket)[number];
type CrewTemplate = (typeof LOG_TEMPLATES.Crew)[number];

export interface AuditActor {
  id: number;
  role: string;
  name?: string;
}

const write = (
  actor: AuditActor,
  action: string,
  targetType: string,
  targetId: string | number,
  detail: string
): void => {
  getState().auditLog.push({
    id: nextAuditLogId(),
    actor: `${actor.role}#${actor.id}${actor.name ? `(${actor.name})` : ""}`,
    action,
    target_type: targetType,
    target_id: String(targetId),
    detail,
    created_at: new Date().toISOString()
  });
  console.info(
    `[audit] ${action} ${toAuditTarget(targetType, targetId)} by ${actor.role}#${actor.id} :: ${detail}`
  );
};

/** 日志模板的唯一调用入口，字段文案变更只改这里与 logTemplates。 */
export const auditLogger = {
  ticketDispatch: (
    actor: AuditActor,
    ticketId: number,
    params: { crewId: number; assetId: number | null; faultReportId: number }
  ) =>
    write(
      actor,
      LOG_TEMPLATES.RepairTicket[4],
      "RepairTicket",
      ticketId,
      `ticket=${ticketId} dispatched to crew=${params.crewId}; faultReport=${params.faultReportId}; asset=${params.assetId ?? "-"}`
    ),
  ticketTransition: (
    actor: AuditActor,
    template: RepairTicketTemplate,
    ticketId: number,
    detail: string
  ) => write(actor, template, "RepairTicket", ticketId, detail),
  crewDutySwitch: (actor: AuditActor, crewId: number, detail: string) =>
    write(actor, LOG_TEMPLATES.Crew[4], "Crew", crewId, detail),
  crewOccupy: (actor: AuditActor, crewId: number, ticketId: number) =>
    write(actor, LOG_TEMPLATES.Crew[5], "Crew", crewId, `crew=${crewId} occupied by ticket=${ticketId}`),
  crewRelease: (actor: AuditActor, crewId: number, ticketId: number) =>
    write(actor, LOG_TEMPLATES.Crew[6], "Crew", crewId, `crew=${crewId} released from ticket=${ticketId}`)
};
