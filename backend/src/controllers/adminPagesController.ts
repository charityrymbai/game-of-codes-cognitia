import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AdminService } from "../services/adminService";
import { renderLoginPage } from "../views/loginPage";
import { renderDashboardPage } from "../views/dashboardPage";
import { renderContestPage } from "../views/contestPage";

export class AdminPagesController {
  // GET /admin — login form
  static getLogin(req: Request, res: Response): void {
    // Already logged in? Skip to dashboard
    const token = req.cookies?.admin_token as string | undefined;
    if (token) {
      try {
        const secret = process.env.JWT_SECRET!;
        jwt.verify(token, secret);
        res.redirect("/admin/dashboard");
        return;
      } catch {
        // token invalid, show login
      }
    }
    res.send(renderLoginPage());
  }

  // POST /admin/login — process login
  static async postLogin(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      res.send(renderLoginPage("Username and password are required."));
      return;
    }

    try {
      const { token } = await AdminService.login(username, password);
      res.cookie("admin_token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
      });
      res.redirect("/admin/dashboard");
    } catch {
      res.send(renderLoginPage("Invalid username or password."));
    }
  }

  // GET /admin/logout
  static getLogout(_req: Request, res: Response): void {
    res.clearCookie("admin_token");
    res.redirect("/admin");
  }

  // GET /admin/dashboard
  static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const contests = await AdminService.listContests();
      const flash = (req as Request & { flash?: { type: "error" | "success"; message: string } })
        .flash;
      res.send(renderDashboardPage(contests, flash));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load contests";
      res.send(renderDashboardPage([], { type: "error", message: msg }));
    }
  }

  // POST /admin/dashboard/contests — create contest
  static async postCreateContest(req: Request, res: Response): Promise<void> {
    const { id, name } = req.body as { id?: string; name?: string };

    if (!id || !/^[0-9]{4}$/.test(id)) {
      const contests = await AdminService.listContests().catch(() => []);
      res.send(
        renderDashboardPage(contests, {
          type: "error",
          message: "Contest ID must be exactly 4 digits.",
        })
      );
      return;
    }

    if (!name || name.trim().length === 0) {
      const contests = await AdminService.listContests().catch(() => []);
      res.send(
        renderDashboardPage(contests, {
          type: "error",
          message: "Contest name is required.",
        })
      );
      return;
    }

    try {
      await AdminService.createContest(id, name.trim());
      res.redirect("/admin/dashboard?created=1");
    } catch (err: unknown) {
      const contests = await AdminService.listContests().catch(() => []);
      const isConflict =
        err instanceof Error && (err as NodeJS.ErrnoException & { code?: string }).code === "P2002";
      res.send(
        renderDashboardPage(contests, {
          type: "error",
          message: isConflict
            ? `Contest ID "${id}" already exists. Choose a different ID.`
            : "Failed to create contest. Please try again.",
        })
      );
    }
  }

  // GET /admin/contests/:id
  static async getContest(req: Request, res: Response): Promise<void> {
    const contestId = req.params["id"] as string;
    const successMsg = req.query["msg"] as string | undefined;
    const errorMsg = req.query["err"] as string | undefined;

    const flash = successMsg
      ? { type: "success" as const, message: successMsg }
      : errorMsg
        ? { type: "error" as const, message: errorMsg }
        : null;

    try {
      const [contests, games, users] = await Promise.all([
        AdminService.listContests(),
        AdminService.listGames(contestId),
        AdminService.getUsers(contestId),
      ]);

      const contest = contests.find((c) => c.id === contestId);
      if (!contest) {
        res.status(404).send("<h1>Contest not found</h1>");
        return;
      }

      res.send(renderContestPage(contest, games, users, flash));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load contest";
      res.status(500).send(`<h1>Error: ${msg}</h1>`);
    }
  }

  // POST /admin/contests/:id/games — add game
  static async postAddGame(req: Request, res: Response): Promise<void> {
    const contestId = req.params["id"] as string;
    const { title, description, boilerplateHtml, boilerplateCss, boilerplateJs } = req.body as {
      title?: string;
      description?: string;
      boilerplateHtml?: string;
      boilerplateCss?: string;
      boilerplateJs?: string;
    };

    if (!title || !description) {
      res.redirect(`/admin/contests/${contestId}?err=Title+and+description+are+required`);
      return;
    }

    try {
      await AdminService.addGame(
        contestId,
        title.trim(),
        description.trim(),
        boilerplateHtml ?? "",
        boilerplateCss ?? "",
        boilerplateJs ?? ""
      );
      res.redirect(`/admin/contests/${contestId}?msg=Game+added+successfully`);
    } catch {
      res.redirect(`/admin/contests/${contestId}?err=Failed+to+add+game`);
    }
  }

  // POST /admin/contests/:id/start — start contest
  static async postStartContest(req: Request, res: Response): Promise<void> {
    const contestId = req.params["id"] as string;
    try {
      await AdminService.startContest(contestId);
      res.redirect(`/admin/contests/${contestId}?msg=Contest+started+successfully`);
    } catch {
      res.redirect(`/admin/contests/${contestId}?err=Failed+to+start+contest`);
    }
  }
}
