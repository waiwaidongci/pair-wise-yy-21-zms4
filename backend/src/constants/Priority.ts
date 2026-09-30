/** 工单优先级，派工台按 URGENT > HIGH > NORMAL 排序。 */
export const Priority = ["NORMAL", "HIGH", "URGENT"] as const;
export type Priority = (typeof Priority)[number];

export const PriorityRank: Record<Priority, number> = {
  URGENT: 0,
  HIGH: 1,
  NORMAL: 2
};
