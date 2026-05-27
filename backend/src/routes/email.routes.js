import { Router } from "express";
import { scanInbox } from "../controllers/email.controller.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

export const emailRoutes = Router();

emailRoutes.use(requireAuth);
emailRoutes.post("/scan", allowRoles("Super Admin", "Operations Admin"), scanInbox);
