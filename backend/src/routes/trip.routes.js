import { Router } from "express";
import { assignTrip, cancelTrip, completeTrip, dutySlip, listTrips, startTrip, updateTripStatus } from "../controllers/trip.controller.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

export const tripRoutes = Router();
tripRoutes.use(requireAuth);
tripRoutes.get("/", listTrips);
tripRoutes.post("/assign", allowRoles("Super Admin", "Operations Admin"), assignTrip);
tripRoutes.patch("/:id/start", allowRoles("Super Admin", "Operations Admin"), startTrip);
tripRoutes.patch("/:id/complete", allowRoles("Super Admin", "Operations Admin"), completeTrip);
tripRoutes.patch("/:id/status", allowRoles("Super Admin", "Operations Admin"), updateTripStatus);
tripRoutes.post("/:id/duty-slip", allowRoles("Super Admin", "Operations Admin"), dutySlip);
tripRoutes.delete("/:id", allowRoles("Super Admin", "Operations Admin"), cancelTrip);
