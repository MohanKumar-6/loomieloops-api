import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { getMe, updateMe } from "../controllers/userController.js";

const router = Router();

router.get("/me", authenticateToken, getMe);
router.patch("/me", authenticateToken, updateMe);

export default router;
