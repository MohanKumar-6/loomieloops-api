import { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  products,
  orders,
  users,
  announcements,
  settings,
  tracking,
} from "../db/schema.js";
import { eq, desc, sql, gte } from "drizzle-orm";
import { uploadImage } from "../services/cloudinaryService.js";
import { formatProduct, serializeProductImages } from "../utils/productImages.js";

export const getStats = async (_req: Request, res: Response) => {
  try {
    const [salesRow] = await db
      .select({ total: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
      .from(orders);

    const [activeRow] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(sql`${orders.status} IN ('pending', 'processing', 'shipped')`);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [customersRow] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo));

    const [productCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products);

    res.json({
      totalSales: Number(salesRow?.total ?? 0),
      activeOrders: Number(activeRow?.count ?? 0),
      newCustomers: Number(customersRow?.count ?? 0),
      totalProducts: Number(productCount?.count ?? 0),
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const {
    id,
    name,
    price,
    image,
    images,
    category,
    stock,
    description,
    dimensions,
    material,
    care,
    color,
  } = req.body;
  if (!id || !name || price == null || !category) {
    return res.status(400).json({ message: "id, name, price, and category are required" });
  }
  try {
    const gallery = Array.isArray(images) ? images : image ? [image] : [];
    const serialized = serializeProductImages(gallery);
    await db.insert(products).values({
      id,
      name,
      price: String(price),
      image: serialized.image,
      images: serialized.images,
      category,
      stock: stock ?? 0,
      description: description ?? null,
      dimensions: dimensions ?? null,
      material: material ?? null,
      care: care ?? null,
      color: color ?? null,
    });
    const created = await db.select().from(products).where(eq(products.id, id));
    res.status(201).json(formatProduct(created[0]));
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Error creating product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    price,
    image,
    images,
    category,
    stock,
    description,
    dimensions,
    material,
    care,
    color,
  } = req.body;
  try {
    const existing = await db.select().from(products).where(eq(products.id, id));
    if (existing.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = String(price);
    if (category !== undefined) updates.category = category;
    if (stock !== undefined) updates.stock = stock;
    if (description !== undefined) updates.description = description || null;
    if (dimensions !== undefined) updates.dimensions = dimensions || null;
    if (material !== undefined) updates.material = material || null;
    if (care !== undefined) updates.care = care || null;
    if (color !== undefined) updates.color = color || null;

    if (images !== undefined) {
      const serialized = serializeProductImages(Array.isArray(images) ? images : []);
      updates.image = serialized.image;
      updates.images = serialized.images;
    } else if (image !== undefined) {
      const serialized = serializeProductImages(image ? [image] : []);
      updates.image = serialized.image;
      updates.images = serialized.images;
    }

    await db.update(products).set(updates).where(eq(products.id, id));
    const updated = await db.select().from(products).where(eq(products.id, id));
    res.json(formatProduct(updated[0]));
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Error updating product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.delete(products).where(eq(products.id, id));
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};

export const uploadProductImage = async (req: Request, res: Response) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ message: "Base64 image data required" });
  }
  try {
    const url = await uploadImage(image);
    res.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading image" });
  }
};

export const getOrders = async (_req: Request, res: Response) => {
  try {
    const allOrders = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));
    res.json(allOrders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }
  try {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
    const updated = await db.select().from(orders).where(eq(orders.id, id));
    if (updated.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(updated[0]);
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ message: "Error updating order" });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
    res.json(allUsers);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const getAnnouncements = async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(announcements).orderBy(desc(announcements.createdAt));
    res.json(rows);
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({ message: "Error fetching announcements" });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  const { content, isActive } = req.body;
  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }
  try {
    if (isActive) {
      await db.update(announcements).set({ isActive: 0 });
    }
    await db.insert(announcements).values({
      content,
      isActive: isActive ? 1 : 0,
    });
    const rows = await db.select().from(announcements).orderBy(desc(announcements.createdAt)).limit(1);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({ message: "Error creating announcement" });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content, isActive } = req.body;
  try {
    if (isActive) {
      await db.update(announcements).set({ isActive: 0 });
    }
    await db
      .update(announcements)
      .set({
        ...(content !== undefined && { content }),
        ...(isActive !== undefined && { isActive: isActive ? 1 : 0 }),
      })
      .where(eq(announcements.id, id));
    const rows = await db.select().from(announcements).where(eq(announcements.id, id));
    if (rows.length === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Update announcement error:", error);
    res.status(500).json({ message: "Error updating announcement" });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.delete(announcements).where(eq(announcements.id, id));
    res.json({ message: "Announcement deleted" });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({ message: "Error deleting announcement" });
  }
};

export const getActiveAnnouncement = async (_req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(announcements)
      .where(eq(announcements.isActive, 1))
      .orderBy(desc(announcements.createdAt))
      .limit(1);
    res.json(rows[0] ?? null);
  } catch (error) {
    console.error("Get active announcement error:", error);
    res.status(500).json({ message: "Error fetching announcement" });
  }
};

export const getAdminSettings = async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(settings);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json(map);
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: "Error fetching settings" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  const data = req.body as Record<string, string>;
  if (!data || typeof data !== "object") {
    return res.status(400).json({ message: "Settings object required" });
  }
  try {
    for (const [key, value] of Object.entries(data)) {
      await db
        .insert(settings)
        .values({ key, value })
        .onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } });
    }
    const rows = await db.select().from(settings);
    res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: "Error updating settings" });
  }
};

export const getHeroSettings = async (_req: Request, res: Response) => {
  const defaultQuips = [
    "Hooked, not hurried",
    "Beige was never invited",
    "Stitch count: vibes only",
    "Caffeine-powered loops",
  ];

  try {
    const rows = await db.select().from(settings);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    let quips = defaultQuips;
    if (map.hero_quips) {
      try {
        const parsed = JSON.parse(map.hero_quips);
        if (Array.isArray(parsed) && parsed.length === 4 && parsed.every((q) => typeof q === "string")) {
          quips = parsed;
        }
      } catch {
        /* use defaults */
      }
    }

    res.json({
      tag: map.hero_tag ?? "HANDMADE CROCHET MAGIC",
      headline: map.hero_headline ?? "HOOKED ON LOOPS.",
      subheadline:
        map.hero_subheadline ??
        "One-of-a-kind crochet pieces, hand-hooked in small batches.",
      image: map.hero_image ?? null,
      quips,
    });
  } catch (error) {
    console.error("Get hero settings error:", error);
    res.status(500).json({ message: "Error fetching hero settings" });
  }
};

export const getFooterSettings = async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(settings);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({ image: map.footer_dp ?? null });
  } catch (error) {
    console.error("Get footer settings error:", error);
    res.status(500).json({ message: "Error fetching footer settings" });
  }
};

export const addTrackingEvent = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status, location } = req.body;
  if (!status || !location) {
    return res.status(400).json({ message: "Status and location are required" });
  }
  try {
    await db.insert(tracking).values({ orderId, status, location });
    const events = await db
      .select()
      .from(tracking)
      .where(eq(tracking.orderId, orderId))
      .orderBy(desc(tracking.updatedAt));
    res.status(201).json(events);
  } catch (error) {
    console.error("Add tracking error:", error);
    res.status(500).json({ message: "Error adding tracking event" });
  }
};
