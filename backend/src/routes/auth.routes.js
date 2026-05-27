import { Router } from "express";
import { login, logout, me, refresh } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, refreshSchema } from "../validations/auth.validation.js";

export const authRoutes = Router();
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.post("/refresh", validate(refreshSchema), refresh);
authRoutes.get("/me", requireAuth, me);
authRoutes.post("/logout", requireAuth, logout);
