import type { VersionedRepairTicket } from "../models/RepairTicket";
import type { RepairTicket } from "../models/RepairTicket";

/** 列表/详情响应：对外暴露乐观锁 version，供派工保存时做并发比对。 */
export interface RepairTicketDto extends RepairTicket {
  version: number;
}

export const createRepairTicketDto = (row: VersionedRepairTicket): RepairTicketDto => {
  const { version, ...fields } = row;
  return { ...fields, version };
};

export const createRepairTicketDtoList = (rows: VersionedRepairTicket[]): RepairTicketDto[] =>
  rows.map(createRepairTicketDto);
