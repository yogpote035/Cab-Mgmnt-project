import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildCrudService } from "../services/crudService.js";

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
      const item = await service.update(req.params.id, req.body);
      if (!item) throw new ApiError(404, "Record not found");
      res.json(item);
    }),
    remove: asyncHandler(async (req, res) => {
      const item = await service.remove(req.params.id);
      if (!item) throw new ApiError(404, "Record not found");
      res.json({ message: "Deleted" });
    })
  };
}
