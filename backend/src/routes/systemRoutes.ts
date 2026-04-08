import { Router } from "express";
import { SystemController } from "../controllers/systemController";
import { validateBody } from "../middlewares/validateBody";
import { systemErrorSchema } from "../schemas";

const router = Router();

// POST /api/system/error — no auth required
router.post("/error", validateBody(systemErrorSchema), SystemController.logError);

export default router;
