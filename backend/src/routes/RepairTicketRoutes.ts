import { Router } from "express";
import { repairTicketController } from "../controllers/RepairTicketController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", repairTicketController.list);
router.post("/:id/dispatch", rbacMiddleware("dispatcher", "admin"), repairTicketController.dispatch);
router.patch("/:id/status", repairTicketController.transitionStatus);

export default router;
