import { Router } from "express";
import { crewController } from "../controllers/CrewController";
import { dispatchController } from "../controllers/DispatchController";

const router = Router();

router.get("/", crewController.list);
router.get("/:id", crewController.detail);
// 当值状态切换：触发候选失效重算
router.post("/:crewId/duty", dispatchController.crewDuty);

export default router;
