import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { EntityForm } from "../components/forms/EntityForm";
import { Modal } from "../components/common/Modal";
import { DataTable } from "../components/tables/DataTable";

export function EntityPage({ title, subtitle, stateKey, actions, columns, fields, schema, defaults, extraActions, canEditRow = () => true, lockedLabel = "Locked" }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
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
        <div className="flex flex-wrap items-center gap-2">
          {extraActions}
          <button className="btn-primary" onClick={() => { setEditingRow(null); setOpen(true); }}><Plus className="h-4 w-4" />Add</button>
        </div>
      </div>
      <div className="panel p-4">
        <DataTable
          loading={state.loading}
          rows={state.items}
          columns={columns}
          actions={(row) => {
            const canEdit = canEditRow(row);
            if (!canEdit) {
              return (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <Lock className="h-3 w-3" />
                  {lockedLabel}
                </span>
              );
            }

            return (
              <div className="flex justify-end gap-2">
                <button className="btn-secondary p-2" onClick={() => { setEditingRow(row); setOpen(true); }} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button className="btn-secondary p-2 text-red-600 hover:text-red-700" onClick={() => dispatch(actions.deleteOne(row._id))} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          }}
        />
      </div>
      <Modal open={open} title={`${editingRow ? "Edit" : "Add"} ${title}`} onClose={() => { setOpen(false); setEditingRow(null); }}>
        <EntityForm
          fields={fields}
          schema={formSchema}
          defaults={editingRow || defaults}
          submitLabel={editingRow ? "Update" : "Save"}
          onSubmit={async (values) => {
            if (editingRow) {
              await dispatch(actions.updateOne({ id: editingRow._id, payload: values }));
            } else {
              await dispatch(actions.createOne(values));
            }
            setOpen(false);
            setEditingRow(null);
          }}
        />
      </Modal>
    </div>
  );
}
