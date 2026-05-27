import { Router } from "express";
import { resourceController } from "../controllers/resource.controller.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

export function resourceRoutes(Model, roles) {
  const router = Router();
  const controller = resourceController(Model);
  router.use(requireAuth);
  router.get("/", controller.list);
  router.get("/:id", controller.get);
  router.post("/", allowRoles(...roles), controller.create);
  router.put("/:id", allowRoles(...roles), controller.update);
  router.delete("/:id", allowRoles(...roles), controller.remove);
  return router;
}
