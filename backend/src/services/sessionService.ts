import prisma from "../prisma/client";
import redis from "../redis";

export class SessionService {
  /**
   * Save code for a game — write to Redis + upsert DB
   */
  static async saveCode(
    sessionId: string,
    gameId: string,
    html: string,
    css: string,
    js: string
  ) {
    // Check if already submitted
    const session = await prisma.session.findUnique({
      where: { sessionId },
      select: { isSubmitted: true, isCheater: true },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.isSubmitted) {
      throw new Error("Cannot save — already submitted");
    }

    if (session.isCheater) {
      throw new Error("Session is flagged for violation");
    }

    // Write to Redis hash
    const codeData = JSON.stringify({ html, css, js });
    await redis.hset(`game_code:${sessionId}`, gameId, codeData);

    // Upsert to DB
    await prisma.submission.upsert({
      where: {
        sessionId_gameId: { sessionId, gameId },
      },
      update: { html, css, js },
      create: { sessionId, gameId, html, css, js },
    });

    return { success: true };
  }

  /**
   * Submit — mark session as submitted
   */
  static async submit(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { sessionId },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.isSubmitted) {
      throw new Error("Already submitted");
    }

    await prisma.session.update({
      where: { sessionId },
      data: { isSubmitted: true },
    });

    return { success: true };
  }

  /**
   * Mark session as cheater
   */
  static async violation(sessionId: string) {
    await prisma.session.update({
      where: { sessionId },
      data: { isCheater: true },
    });

    return { success: true };
  }

  /**
   * Restore code: Redis first, DB fallback, repopulate Redis on miss
   */
  static async restore(sessionId: string) {
    // Try Redis first
    const cached = await redis.hgetall(`game_code:${sessionId}`);

    if (cached && Object.keys(cached).length > 0) {
      const result: Record<string, { html: string; css: string; js: string }> = {};
      for (const [gameId, value] of Object.entries(cached)) {
        result[gameId] = JSON.parse(value);
      }
      return result;
    }

    // Fallback to DB
    const submissions = await prisma.submission.findMany({
      where: { sessionId },
    });

    const result: Record<string, { html: string; css: string; js: string }> = {};

    for (const sub of submissions) {
      const codeData = { html: sub.html, css: sub.css, js: sub.js };
      result[sub.gameId] = codeData;
      // Repopulate Redis
      await redis.hset(`game_code:${sessionId}`, sub.gameId, JSON.stringify(codeData));
    }

    return result;
  }
}
