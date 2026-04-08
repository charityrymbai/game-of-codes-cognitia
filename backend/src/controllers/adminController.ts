import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/adminService";

export class AdminController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const result = await AdminService.login(username, password);
      res.json(result);
    } catch (error: any) {
      if (error.message === "Invalid admin credentials") {
        res.status(401).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  static async listContests(_req: Request, res: Response, next: NextFunction) {
    try {
      const contests = await AdminService.listContests();
      res.json({ contests });
    } catch (error) {
      next(error);
    }
  }

  static async createContest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, name } = req.body;
      const contest = await AdminService.createContest(id, name);
      res.status(201).json(contest);
    } catch (error: any) {
      if (error.code === "P2002") {
        res.status(409).json({ error: "Contest ID already exists" });
      } else {
        next(error);
      }
    }
  }

  static async listGames(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const games = await AdminService.listGames(id);
      res.json({ games });
    } catch (error) {
      next(error);
    }
  }

  static async addGame(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { title, description } = req.body;
      const game = await AdminService.addGame(id, title, description);
      res.status(201).json(game);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const users = await AdminService.getUsers(id);
      res.json({ users });
    } catch (error) {
      next(error);
    }
  }

  static async startContest(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await AdminService.startContest(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
