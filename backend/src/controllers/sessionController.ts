import { Request, Response, NextFunction } from "express";
import { SessionService } from "../services/sessionService";

export class SessionController {
  static async save(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const { gameId, html, css, js } = req.body;

      // Verify the sessionId matches the JWT
      if (req.user?.sessionId !== sessionId) {
        res.status(403).json({ error: "Unauthorized session access" });
        return;
      }

      const result = await SessionService.saveCode(sessionId, gameId, html, css, js);
      res.json(result);
    } catch (error: any) {
      if (
        error.message === "Cannot save — already submitted" ||
        error.message === "Session is flagged for violation" ||
        error.message === "Session not found"
      ) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;

      if (req.user?.sessionId !== sessionId) {
        res.status(403).json({ error: "Unauthorized session access" });
        return;
      }

      const result = await SessionService.submit(sessionId);
      res.json(result);
    } catch (error: any) {
      if (error.message === "Already submitted" || error.message === "Session not found") {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  static async violation(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;

      if (req.user?.sessionId !== sessionId) {
        res.status(403).json({ error: "Unauthorized session access" });
        return;
      }

      const result = await SessionService.violation(sessionId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;

      if (req.user?.sessionId !== sessionId) {
        res.status(403).json({ error: "Unauthorized session access" });
        return;
      }

      const data = await SessionService.restore(sessionId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}
