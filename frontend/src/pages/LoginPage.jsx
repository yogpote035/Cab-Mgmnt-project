import { zodResolver } from "@hookform/resolvers/zod";
import { CarFront } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import { login } from "../redux/slices/authSlice";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export function LoginPage() {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "superadmin@caberp.local", password: "Admin@12345" }
  });
  if (isAuthenticated) return <Navigate to="/" replace />;
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <div className="panel w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-md bg-brand-600 p-3 text-white"><CarFront className="h-6 w-6" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-950 dark:text-white">Cab ERP</h1>
            <p className="text-sm text-slate-500">Corporate cab operations console</p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit((values) => dispatch(login(values)))}>
          <label><span className="mb-1 block text-sm font-medium">Email</span><input className="input" {...register("email")} />{errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}</label>
          <label><span className="mb-1 block text-sm font-medium">Password</span><input type="password" className="input" {...register("password")} />{errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}</label>
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40">{error}</div>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        </form>
      </div>
    </div>
  );
}
