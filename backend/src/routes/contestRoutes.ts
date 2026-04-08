import { Router } from "express";
import { ContestController } from "../controllers/contestController";
import { jwtMiddleware } from "../middlewares/jwtMiddleware";
import { validateBody } from "../middlewares/validateBody";
import { joinContestSchema } from "../schemas";

const router = Router();

// POST /api/contests/join — public
router.post("/join", validateBody(joinContestSchema), ContestController.join);

// GET /api/contests/:contestId/status — public (lobby polling)
router.get("/:contestId/status", ContestController.getStatus);

// GET /api/contests/:contestId/games — auth required
router.get("/:contestId/games", jwtMiddleware, ContestController.getGames);

export default router;
