import { Router } from "express";
import { changePassword, login, logout, me, refresh, updateProfile } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, refreshSchema } from "../validations/auth.validation.js";

export const authRoutes = Router();
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.post("/refresh", validate(refreshSchema), refresh);
authRoutes.get("/me", requireAuth, me);
authRoutes.put("/profile", requireAuth, updateProfile);
authRoutes.put("/change-password", requireAuth, changePassword);
authRoutes.post("/logout", requireAuth, logout);
