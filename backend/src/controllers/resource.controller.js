import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildCrudService } from "../services/crudService.js";
import { Trip } from "../models/Trip.js";

export function resourceController(Model) {
  const service = buildCrudService(Model);
  return {
    list: asyncHandler(async (req, res) => res.json(await service.list(req.query))),
    get: asyncHandler(async (req, res) => {
      const item = await service.get(req.params.id);
      if (!item) throw new ApiError(404, "Record not found");
      res.json(item);
    }),
    create: asyncHandler(async (req, res) => res.status(201).json(await service.create(req.body))),
    update: asyncHandler(async (req, res) => {
      await assertAllowedUpdate(Model, req.params.id, req.body);
      await assertMutable(Model, req.params.id, "update");
      const item = await service.update(req.params.id, req.body);
      if (!item) throw new ApiError(404, "Record not found");
      res.json(item);
    }),
    remove: asyncHandler(async (req, res) => {
      await assertMutable(Model, req.params.id, "delete");
      const item = await service.remove(req.params.id);
      if (!item) throw new ApiError(404, "Record not found");
      res.json({ message: "Deleted" });
    })
  };
}

async function assertAllowedUpdate(Model, id, payload) {
  if (Model.modelName !== "Booking") return;
  if (payload.status !== "Assigned") return;

  const trip = await Trip.findOne({ booking: id }).select("_id");
  if (!trip) {
    throw new ApiError(
      400,
      "Cannot mark inquiry as Assigned manually. Use Bookings > Trips > Assign Trip to select driver and vehicle."
    );
  }
}

async function assertMutable(Model, id, action) {
  if (Model.modelName !== "Booking") return;

  const booking = await Model.findById(id).select("status bookingId");
  if (!booking) throw new ApiError(404, "Record not found");

  if (booking.status === "Assigned") {
    throw new ApiError(
      409,
      `Inquiry ${booking.bookingId} is already converted to a trip and cannot be ${action}d.`
    );
  }
}
