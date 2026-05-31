import { db } from "./index.js";
import { products, users } from "./schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const seedProducts = [
  {
    id: "hot-pink-disco",
    name: "Hot Pink Disco",
    price: "2499.00",
    image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg", // Placeholder
    category: "bags",
    stock: 50,
  },
  {
    id: "cyan-static",
    name: "Cyan Static",
    price: "2499.00",
    image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg", // Placeholder
    category: "accessories",
    stock: 35,
  },
  {
    id: "lime-riot",
    name: "Lime Riot",
    price: "2299.00",
    image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg", // Placeholder
    category: "home",
    stock: 20,
  },
  {
    id: "mustard-thunder",
    name: "Mustard Thunder",
    price: "2999.00",
    image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg", // Placeholder
    category: "home",
    stock: 15,
  },
  {
    id: "burnt-orange-bomb",
    name: "Burnt Orange Bomb",
    price: "2299.00",
    image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg", // Placeholder
    category: "accessories",
    stock: 40,
  },
  {
    id: "ultra-violet-speckle",
    name: "Ultra Violet Speckle",
    price: "32.00",
    image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg", // Placeholder
    category: "plush",
    stock: 10,
  },
  {
    id: "raw-cream",
    name: "Raw Cream",
    price: "22.00",
    image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg", // Placeholder
    category: "accessories",
    stock: 25,
  },
];

async function seed() {
  console.log("Seeding admin user...");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@loomieloops.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hashed = await bcrypt.hash(adminPassword, 10);
  const existing = await db.select().from(users).where(eq(users.email, adminEmail));
  if (existing.length === 0) {
    await db.insert(users).values({
      email: adminEmail,
      password: hashed,
      name: "Mohan Kumar",
      role: "admin",
    });
    console.log(`Admin created: ${adminEmail}`);
  } else {
    await db.update(users).set({ role: "admin", password: hashed, name: "Mohan Kumar" }).where(eq(users.email, adminEmail));
    console.log(`Admin updated: ${adminEmail}`);
  }

  console.log("Seeding products...");
  for (const product of seedProducts) {
    await db.insert(products).values(product).onDuplicateKeyUpdate({
      set: {
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
      },
    });
  }
  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
