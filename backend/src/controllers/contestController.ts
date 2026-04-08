import { Request, Response, NextFunction } from "express";
import { ContestService } from "../services/contestService";

export class ContestController {
  static async join(req: Request, res: Response, next: NextFunction) {
    try {
      const { contestId, rollNo } = req.body;
      const result = await ContestService.join(contestId, rollNo);
      res.json(result);
    } catch (error: any) {
      if (error.message === "Contest not found") {
        res.status(404).json({ error: error.message });
      } else if (error.message === "This roll number is already registered") {
        res.status(409).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const contestId = req.params.contestId as string;
      const result = await ContestService.getStatus(contestId);
      res.json(result);
    } catch (error: any) {
      if (error.message === "Contest not found") {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  static async getGames(req: Request, res: Response, next: NextFunction) {
    try {
      const contestId = req.params.contestId as string;
      const games = await ContestService.getGames(contestId);
      res.json({ games });
    } catch (error) {
      next(error);
    }
  }
}
