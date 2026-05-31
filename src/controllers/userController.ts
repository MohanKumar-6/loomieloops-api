import { Response } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth.js";

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, req.user!.id));
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      createdAt: user[0].createdAt,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;

  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({ message: "Name must be a string" });
  }

  try {
    await db
      .update(users)
      .set({ name: name?.trim() || null })
      .where(eq(users.id, req.user!.id));

    const updated = await db.select().from(users).where(eq(users.id, req.user!.id));

    res.json({
      id: updated[0].id,
      email: updated[0].email,
      name: updated[0].name,
      createdAt: updated[0].createdAt,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};
