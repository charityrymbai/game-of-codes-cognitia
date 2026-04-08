import { Router } from "express";
import { AdminPagesController } from "../controllers/adminPagesController";
import { adminCookieMiddleware } from "../middlewares/adminCookieMiddleware";

const router = Router();

// ── Public routes (no auth) ────────────────────────────────────────
// GET  /admin          → login page
router.get("/", AdminPagesController.getLogin);

// POST /admin/login    → process login form, set cookie, redirect
router.post("/login", AdminPagesController.postLogin);

// ── Logout ────────────────────────────────────────────────────────
// GET  /admin/logout   → clear cookie, redirect to login
router.get("/logout", AdminPagesController.getLogout);

// ── Protected routes (require admin_token cookie) ──────────────────
router.use(adminCookieMiddleware);

// GET  /admin/dashboard               → contest list
router.get("/dashboard", AdminPagesController.getDashboard);

// POST /admin/dashboard/contests      → create contest
router.post("/dashboard/contests", AdminPagesController.postCreateContest);

// GET  /admin/contests/:id            → contest detail (games + users)
router.get("/contests/:id", AdminPagesController.getContest);

// POST /admin/contests/:id/games      → add game
router.post("/contests/:id/games", AdminPagesController.postAddGame);

// POST /admin/contests/:id/start      → start contest
router.post("/contests/:id/start", AdminPagesController.postStartContest);

export default router;
