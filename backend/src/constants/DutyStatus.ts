/** 班组当值状态：只有 ON_DUTY 的班组才可能成为派工候选。 */
export const DutyStatus = ["ON_DUTY", "OFF_DUTY"] as const;
export type DutyStatus = (typeof DutyStatus)[number];
