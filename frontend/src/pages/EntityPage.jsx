import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { EntityForm } from "../components/forms/EntityForm";
import { Modal } from "../components/common/Modal";
import { DataTable } from "../components/tables/DataTable";

export function EntityPage({ title, subtitle, stateKey, actions, columns, fields, schema, defaults }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const state = useSelector((store) => store[stateKey]);
  useEffect(() => { dispatch(actions.fetchAll()); }, [dispatch, actions]);
  const formSchema = schema || z.object(Object.fromEntries(fields.map((field) => [field.name, field.type === "number" ? z.coerce.number().min(0) : z.string().min(field.required === false ? 0 : 1, "Required")])));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add</button>
      </div>
      <div className="panel p-4">
        <DataTable loading={state.loading} rows={state.items} columns={columns} actions={(row) => <button className="btn-secondary p-2" onClick={() => dispatch(actions.deleteOne(row._id))} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>} />
      </div>
      <Modal open={open} title={`Add ${title}`} onClose={() => setOpen(false)}>
        <EntityForm fields={fields} schema={formSchema} defaults={defaults} onSubmit={async (values) => { await dispatch(actions.createOne(values)); setOpen(false); }} />
      </Modal>
    </div>
  );
}
