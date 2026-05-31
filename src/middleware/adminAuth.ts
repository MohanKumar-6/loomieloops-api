import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.js";

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    req.user = user;
    next();
  });
};
