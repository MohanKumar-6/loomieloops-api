import { defineConfig } from "drizzle-kit";
import process from "node:process";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.MYSQL_URL!,
  },
});
