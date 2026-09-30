import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { authMiddleware } from "./middlewares/authMiddleware";
import { auditLogMiddleware } from "./middlewares/auditLogMiddleware";
import { requestLoggerMiddleware } from "./middlewares/requestLoggerMiddleware";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware";
import { rbacMiddleware } from "./middlewares/rbacMiddleware";
import { rateLimitMiddleware } from "./middlewares/rateLimitMiddleware";
import gridAssetRoutes from "./routes/GridAssetRoutes";
import faultReportRoutes from "./routes/FaultReportRoutes";
import repairTicketRoutes from "./routes/RepairTicketRoutes";
import crewRoutes from "./routes/CrewRoutes";
import sparePartUsageRoutes from "./routes/SparePartUsageRoutes";
import { getState } from "./repositories/store";

const app = express();
app.use(cors({ exposedHeaders: ["x-simulate-write-failure"] }));
app.use(express.json());
app.use(requestLoggerMiddleware);
app.use(authMiddleware);
app.use(auditLogMiddleware);
app.use(rateLimitMiddleware);

const dispatcherOnly = rbacMiddleware(["DISPATCHER", "ADMIN"]);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "grid-repair" }));
app.get("/api/audit-logs", (_req, res) => res.json(getState().auditLog));

app.use("/api/grid-asset", gridAssetRoutes);
app.use("/api/fault-report", faultReportRoutes);
app.use("/api/spare-part-usage", sparePartUsageRoutes);

// 派工台写操作需要调度员角色
app.post("/api/repair-ticket/:ticketId/dispatch", dispatcherOnly);
app.post("/api/repair-ticket/:ticketId/transition", dispatcherOnly);
app.post("/api/crew/:crewId/duty", dispatcherOnly);

app.use("/api/repair-ticket", repairTicketRoutes);
app.use("/api/crew", crewRoutes);
app.use(errorHandlerMiddleware);

if (require.main === module) {
  app.listen(config.port, () => console.log("grid-repair backend listening on", config.port));
}

export { app };
