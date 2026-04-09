import prisma from "../prisma/client";
import redis from "../redis";
import jwt from "jsonwebtoken";

export class AdminService {
  /**
   * Admin login — verify credentials from env vars
   */
  static async login(username: string, password: string) {
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (username !== adminUser || password !== adminPass) {
      throw new Error("Invalid admin credentials");
    }

    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      { username, role: "admin" as const },
      secret,
      { expiresIn: "2h" }
    );

    return { token };
  }

  /**
   * List all contests
   */
  static async listContests() {
    return prisma.contest.findMany({
      include: {
        _count: {
          select: { games: true, sessions: true },
        },
      },
    });
  }

  /**
   * Create a new contest
   */
  static async createContest(id: string, name: string) {
    return prisma.contest.create({
      data: { id, name },
    });
  }

  /**
   * List games for a contest
   */
  static async listGames(contestId: string) {
    return prisma.game.findMany({
      where: { contestId },
      select: {
        id: true,
        contestId: true,
        title: true,
        description: true,
        boilerplateHtml: true,
        boilerplateCss: true,
        boilerplateJs: true,
      },
    });
  }

  /**
   * Add a game to a contest
   */
  static async addGame(
    contestId: string,
    title: string,
    description: string,
    boilerplateHtml = "",
    boilerplateCss = "",
    boilerplateJs = ""
  ) {
    return prisma.game.create({
      data: {
        contestId,
        title,
        description,
        boilerplateHtml,
        boilerplateCss,
        boilerplateJs,
      },
    });
  }

  static async updateGameBoilerplate(
    contestId: string,
    gameId: string,
    boilerplateHtml = "",
    boilerplateCss = "",
    boilerplateJs = ""
  ) {
    const updated = await prisma.game.updateMany({
      where: {
        id: gameId,
        contestId,
      },
      data: {
        boilerplateHtml,
        boilerplateCss,
        boilerplateJs,
      },
    });

    if (updated.count === 0) {
      throw new Error("Game not found");
    }

    return prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        title: true,
        description: true,
        boilerplateHtml: true,
        boilerplateCss: true,
        boilerplateJs: true,
      },
    });
  }

  /**
   * Get all sessions/users for a contest from Redis + DB
   */
  static async getUsers(contestId: string) {
    // Get all sessions from DB for this contest
    const sessions = await prisma.session.findMany({
      where: { contestId },
      select: {
        sessionId: true,
        rollNo: true,
        isCheater: true,
        isSubmitted: true,
      },
    });

    return sessions;
  }

  /**
   * Start a contest — set status = 1 in DB + Redis
   */
  static async startContest(contestId: string) {
    await prisma.contest.update({
      where: { id: contestId },
      data: { status: 1 },
    });

    // Update Redis cache
    await redis.setex(`contest:${contestId}:status`, 3600, "1");

    return { success: true };
  }
}
