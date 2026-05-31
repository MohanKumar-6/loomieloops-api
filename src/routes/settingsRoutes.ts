import { Router } from "express";
import { getHeroSettings, getFooterSettings } from "../controllers/adminController.js";

const router = Router();

router.get("/hero", getHeroSettings);
router.get("/footer", getFooterSettings);

export default router;
