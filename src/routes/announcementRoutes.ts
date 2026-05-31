import { Router } from "express";
import { getActiveAnnouncement, getHeroSettings } from "../controllers/adminController.js";

const router = Router();

router.get("/active", getActiveAnnouncement);

export default router;
