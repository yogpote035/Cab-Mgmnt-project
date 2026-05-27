import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { apiRoutes } from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 600 }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan("dev"));

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "Cab Management ERP API", version: "1.0.0" },
    servers: [{ url: "/api" }]
  },
  apis: ["./src/routes/*.js"]
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);
