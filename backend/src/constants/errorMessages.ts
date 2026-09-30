export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  TICKET_NOT_FOUND: "repair ticket not found: {id}",
  CREW_NOT_FOUND: "repair crew not found: {id}",
  ASSET_NOT_FOUND: "grid asset not found: {id}",
  FAULT_REPORT_NOT_FOUND: "fault report not found: {id}",
  DISPATCH_VERSION_CONFLICT:
    "ticket {id} was dispatched or changed by another dispatcher (expected version {expected}, actual {actual})",
  DISPATCH_STATUS_CHANGED:
    "ticket {id} is no longer WAIT_DISPATCH, current status: {status}",
  CREW_NOT_AVAILABLE: "crew {id} is not a valid dispatch candidate anymore",
  SKILL_NOT_MATCHED: "crew {id} does not have any required skill: {skills}",
  CREW_NOT_ON_DUTY: "crew {id} is not on duty (duty_status={status})",
  CREW_BUSY: "crew {id} already holds open ticket {ticketId}",
  ILLEGAL_TICKET_TRANSITION:
    "ticket {id} cannot move from {from} to {to}; allowed next status is {allowed}",
  DISPATCH_WRITE_FAILED: "dispatch write failed, all of ticket/crew/asset writes have been rolled back"
} as const;
