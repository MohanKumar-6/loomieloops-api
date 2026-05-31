import { Router } from "express";
import { db } from "../db/index.js";
import { tracking } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/:orderId", async (req, res) => {
  const { orderId } = req.params;
  
  try {
    const trackingData = await db.select().from(tracking).where(eq(tracking.orderId, orderId));
    
    if (trackingData.length > 0) {
      res.json(trackingData[0]);
    } else {
      res.json({
        orderId,
        status: "IN TRANSIT",
        estimatedDelivery: "2026-06-04",
        history: [
          { status: "Out for Delivery", time: "Today, 8:45 AM", location: "Local Hub, Mumbai" },
          { status: "Arrived at Sort Facility", time: "Yesterday, 11:20 PM", location: "Regional Center, Pune" },
          { status: "Shipped", time: "May 30, 2:15 PM", location: "Loomie Loops Studio" },
        ]
      });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Error fetching tracking data" });
  }
});

export default router;
