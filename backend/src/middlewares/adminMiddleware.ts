import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AdminPayload {
  username: string;
  role: "admin";
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: "JWT secret not configured" });
      return;
    }

    const decoded = jwt.verify(token, secret) as AdminPayload;
    if (decoded.role !== "admin") {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired admin token" });
  }
};
