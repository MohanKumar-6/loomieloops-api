import { Router } from "express";
import { requireAdmin } from "../middleware/adminAuth.js";
import { getAllProducts, getProductById } from "../controllers/productController.js";
import {
  getStats,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getOrders,
  updateOrderStatus,
  getUsers,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAdminSettings,
  updateSettings,
  addTrackingEvent,
} from "../controllers/adminController.js";

const router = Router();

router.use(requireAdmin);

router.get("/stats", getStats);

router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.post("/products", createProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.post("/products/upload-image", uploadProductImage);

router.get("/orders", getOrders);
router.patch("/orders/:id", updateOrderStatus);
router.post("/orders/:orderId/tracking", addTrackingEvent);

router.get("/users", getUsers);

router.get("/announcements", getAnnouncements);
router.post("/announcements", createAnnouncement);
router.patch("/announcements/:id", updateAnnouncement);
router.delete("/announcements/:id", deleteAnnouncement);

router.get("/settings", getAdminSettings);
router.put("/settings", updateSettings);

export default router;
