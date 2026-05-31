import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { sendEmail } from "../services/emailService.js";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user[0].id, email: user[0].email, role: user[0].role ?? "user" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user[0].id, email: user[0].email, name: user[0].name, role: user[0].role ?? "user" }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await db.update(users)
      .set({ resetToken, resetTokenExpiry })
      .where(eq(users.id, user[0].id));

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    await sendEmail(
      email,
      "Password Reset - Loomie Loops",
      `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
    );

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error processing forgot password" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const user = await db.select().from(users).where(eq(users.resetToken, token));
    
    if (user.length === 0 || !user[0].resetTokenExpiry || user[0].resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users)
      .set({ 
        password: hashedPassword, 
        resetToken: null, 
        resetTokenExpiry: null 
      })
      .where(eq(users.id, user[0].id));

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};
