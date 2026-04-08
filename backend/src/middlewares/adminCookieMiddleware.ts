import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AdminPayload } from "./adminMiddleware";

/**
 * Cookie-based admin guard for HTML pages.
 * Reads JWT from the `admin_token` cookie.
 * On failure → redirect to /admin (login page) instead of returning JSON.
 */
export const adminCookieMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.admin_token as string | undefined;
    if (!token) {
      res.redirect("/admin");
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.redirect("/admin");
      return;
    }

    const decoded = jwt.verify(token, secret) as AdminPayload;
    if (decoded.role !== "admin") {
      res.clearCookie("admin_token");
      res.redirect("/admin");
      return;
    }

    req.admin = decoded;
    next();
  } catch {
    res.clearCookie("admin_token");
    res.redirect("/admin");
  }
};
