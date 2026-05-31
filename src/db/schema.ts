import { mysqlTable, varchar, timestamp, text, int, decimal } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: varchar("id", { length: 255 }).primaryKey(), // Using the slug as ID
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"), // Primary image URL (first in gallery)
  images: text("images"), // JSON array of image URLs
  category: varchar("category", { length: 100 }).notNull(),
  stock: int("stock").default(0).notNull(),
  description: text("description"),
  dimensions: text("dimensions"),
  material: text("material"),
  care: text("care"),
  color: varchar("color", { length: 100 }),
});

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tracking = mysqlTable("tracking", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  orderId: varchar("order_id", { length: 36 }).references(() => orders.id).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  location: text("location").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const announcements = mysqlTable("announcements", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  content: text("content").notNull(),
  isActive: int("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
