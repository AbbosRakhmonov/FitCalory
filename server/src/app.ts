import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";

import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/users/user.route";
import mealRoutes from "./modules/meals/meal.route";
import waterRoutes from "./modules/water/water.route";
import aiRoutes from "./modules/ai/ai.route";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/meals", mealRoutes);
app.use("/api/v1/water", waterRoutes);
app.use("/api/v1/ai", aiRoutes);

app.get("/api/v1/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

export default app;
