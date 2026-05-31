import { Router } from "express";
import { getHeroSettings } from "../controllers/adminController.js";

const router = Router();

router.get("/hero", getHeroSettings);

export default router;
