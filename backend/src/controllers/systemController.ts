import { Request, Response } from "express";

export class SystemController {
  static async logError(req: Request, res: Response) {
    const { error, context, stack } = req.body;
    console.error("🔴 Frontend Error:", {
      error,
      context: context || "unknown",
      stack: stack || "no stack trace",
      timestamp: new Date().toISOString(),
    });
    res.json({ received: true });
  }
}
