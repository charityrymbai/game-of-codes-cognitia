import { Router } from "express";
import { SessionController } from "../controllers/sessionController";
import { jwtMiddleware } from "../middlewares/jwtMiddleware";
import { validateBody } from "../middlewares/validateBody";
import { saveCodeSchema } from "../schemas";

const router = Router();

// All session routes require JWT auth
router.use(jwtMiddleware);

// POST /api/sessions/:sessionId/save
router.post("/:sessionId/save", validateBody(saveCodeSchema), SessionController.save);

// POST /api/sessions/:sessionId/submit
router.post("/:sessionId/submit", SessionController.submit);

// POST /api/sessions/:sessionId/violation
router.post("/:sessionId/violation", SessionController.violation);

// GET /api/sessions/:sessionId/restore
router.get("/:sessionId/restore", SessionController.restore);

export default router;
