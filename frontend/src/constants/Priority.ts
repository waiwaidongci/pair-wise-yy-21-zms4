export const Priority = ["NORMAL", "HIGH", "URGENT"] as const;
export type Priority = (typeof Priority)[number];

export const PriorityText: Record<Priority, string> = {
  NORMAL: "常规",
  HIGH: "紧急",
  URGENT: "特急"
};

export const PriorityTone: Record<Priority, "muted" | "warn" | "danger"> = {
  NORMAL: "muted",
  HIGH: "warn",
  URGENT: "danger"
};
