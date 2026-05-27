export function buildCrudService(Model) {
  return {
    list: async (query = {}) => {
      const page = Math.max(Number(query.page || 1), 1);
      const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
      const search = query.search?.trim();
      const filter = {};
      if (query.status) filter.status = query.status;
      if (search) filter.$text ? filter.$text = { $search: search } : filter.$or = searchable(Model).map((field) => ({ [field]: new RegExp(search, "i") }));
      const [items, total] = await Promise.all([
        Model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Model.countDocuments(filter)
      ]);
      return { items, total, page, pages: Math.ceil(total / limit) || 1 };
    },
    get: (id) => Model.findById(id),
    create: (payload) => Model.create(payload),
    update: (id, payload) => Model.findByIdAndUpdate(id, payload, { new: true, runValidators: true }),
    remove: (id) => Model.findByIdAndDelete(id)
  };
}

function searchable(Model) {
  return Object.entries(Model.schema.paths)
    .filter(([, path]) => path.instance === "String")
    .map(([field]) => field)
    .slice(0, 6);
}
