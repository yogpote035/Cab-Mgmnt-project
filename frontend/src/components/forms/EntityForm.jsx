import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export function EntityForm({ schema, fields, defaults = {}, onSubmit, submitLabel = "Save" }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: defaults });
  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field) => (
        <label key={field.name} className={field.full ? "sm:col-span-2" : ""}>
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{field.label}</span>
          {field.type === "select" ? (
            <select className="input" {...register(field.name)}>
              {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : (
            <input className="input" type={field.type || "text"} {...register(field.name, { valueAsNumber: field.type === "number" })} />
          )}
          {errors[field.name] && <span className="mt-1 block text-xs text-red-500">{errors[field.name]?.message}</span>}
        </label>
      ))}
      <div className="sm:col-span-2">
        <button className="btn-primary" disabled={isSubmitting}>{submitLabel}</button>
      </div>
    </form>
  );
}
