import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
/** Default express.json() limit is 100kb; product image uploads use base64 JSON. */
const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT ?? "15mb";

app.use(cors());
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(express.urlencoded({ limit: JSON_BODY_LIMIT, extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/products", productRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && typeof err === "object" && "type" in err && err.type === "entity.too.large") {
    return res.status(413).json({
      message: `Request body too large. Image uploads must be under ${JSON_BODY_LIMIT}.`,
    });
  }
  next(err);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Loomie Loops Backend running at http://localhost:${port}`);
});
