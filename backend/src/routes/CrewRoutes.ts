import { Router } from "express";
import { crewController } from "../controllers/CrewController";

const router = Router();

router.get("/", crewController.list);
router.get("/candidates", crewController.candidates);
router.patch("/:id/duty-status", crewController.setDutyStatus);

export default router;
