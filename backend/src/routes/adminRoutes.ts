import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { validateBody } from "../middlewares/validateBody";
import { adminLoginSchema, createContestSchema, createGameSchema } from "../schemas";

const router = Router();

// POST /api/admin/login — public admin login
router.post("/login", validateBody(adminLoginSchema), AdminController.login);

// All routes below require admin auth
router.use(adminMiddleware);

// GET /api/admin/contests
router.get("/contests", AdminController.listContests);

// POST /api/admin/contests
router.post("/contests", validateBody(createContestSchema), AdminController.createContest);

// GET /api/admin/contests/:id/games
router.get("/contests/:id/games", AdminController.listGames);

// POST /api/admin/contests/:id/games
router.post("/contests/:id/games", validateBody(createGameSchema), AdminController.addGame);

// GET /api/admin/contests/:id/users
router.get("/contests/:id/users", AdminController.getUsers);

// PATCH /api/admin/contests/:id/start
router.patch("/contests/:id/start", AdminController.startContest);

export default router;
