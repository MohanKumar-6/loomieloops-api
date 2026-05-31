import { Request, Response } from "express";
import { db } from "../db/index.js";
import { products } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { formatProduct } from "../utils/productImages.js";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const allProducts = await db.select().from(products);
    res.json(allProducts.map(formatProduct));
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await db.select().from(products).where(eq(products.id, id));
    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(formatProduct(product[0]));
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Error fetching product" });
  }
};
