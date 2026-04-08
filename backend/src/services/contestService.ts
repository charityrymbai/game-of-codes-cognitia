import prisma from "../prisma/client";
import redis from "../redis";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export class ContestService {
  /**
   * Join a contest: validate contest exists, rollNo unique, create session, cache in Redis
   */
  static async join(contestId: string, rollNo: string) {
    // Check contest exists
    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      throw new Error("Contest not found");
    }

    // Check rollNo not already used in this contest
    const existingSession = await prisma.session.findUnique({
      where: { rollNo_contestId: { rollNo, contestId } },
    });
    if (existingSession) {
      throw new Error("This roll number is already registered for this contest");
    }

    // Create session
    const sessionId = uuidv4();
    await prisma.session.create({
      data: {
        sessionId,
        rollNo,
        contestId,
      },
    });

    // Cache in Redis
    await redis.hset("sessions", sessionId, rollNo);

    // Generate JWT
    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      { rollNo, contestId, sessionId },
      secret,
      { expiresIn: "12h" }
    );

    return { token, sessionId };
  }

  /**
   * Get contest status, Redis cached with 1hr TTL
   */
  static async getStatus(contestId: string) {
    // Check Redis first
    const cached = await redis.get(`contest:${contestId}:status`);
    if (cached !== null) {
      return { status: parseInt(cached, 10) };
    }

    // Fallback to DB
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      select: { status: true },
    });

    if (!contest) {
      throw new Error("Contest not found");
    }

    // Cache with 1hr TTL
    await redis.setex(`contest:${contestId}:status`, 3600, contest.status.toString());

    return { status: contest.status };
  }

  /**
   * Get all games for a contest
   */
  static async getGames(contestId: string) {
    const games = await prisma.game.findMany({
      where: { contestId },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });

    return games;
  }
}
