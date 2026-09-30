import { Router } from "express";
import { sparePartUsageController } from "../controllers/SparePartUsageController";

const router = Router();
router.get("/", sparePartUsageController.list);
router.get("/ticket/:ticketId", sparePartUsageController.listByTicket);
export default router;
