import { Router } from "express";
import { repairTicketController } from "../controllers/RepairTicketController";
import { dispatchController } from "../controllers/DispatchController";

const router = Router();

// 派工台（抢修工单 + 抢修班组 + 配网资产 三实体联动）
router.get("/:ticketId/dispatch-candidates", dispatchController.candidates);
router.post("/:ticketId/dispatch", dispatchController.dispatch);
router.post("/:ticketId/transition", dispatchController.transition);

router.get("/", repairTicketController.list);
router.get("/:id", repairTicketController.detail);

export default router;
