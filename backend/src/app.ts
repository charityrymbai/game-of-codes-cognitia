import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import contestRoutes from "./routes/contestRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import adminRoutes from "./routes/adminRoutes";
import adminPagesRoutes from "./routes/adminPagesRoutes";
import systemRoutes from "./routes/systemRoutes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();

// Global middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true })); // for HTML form submissions
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Admin HTML pages (served at /admin/*) ─────────────────
app.use("/admin", adminPagesRoutes);

// ─── JSON API routes ───────────────────────────────────────
app.use("/api/contests", contestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/system", systemRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
