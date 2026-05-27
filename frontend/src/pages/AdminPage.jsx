import { adminActions } from "../redux/slices/adminSlice";
import { EntityPage } from "./EntityPage";

export function AdminsPage() {
  return <EntityPage title="Manage Admins" subtitle="Create users, assign roles, and manage access." stateKey="admins" actions={adminActions} columns={[
    { key: "name", header: "Name" }, { key: "email", header: "Email" }, { key: "role", header: "Role" }, { key: "isActive", header: "Active", render: (r) => r.isActive ? "Yes" : "No" }
  ]} fields={[
    { name: "name", label: "Name" }, { name: "email", label: "Email" }, { name: "password", label: "Password", type: "password" }, { name: "role", label: "Role", type: "select", options: ["Super Admin", "Operations Admin", "Billing Admin", "Viewer"] }
  ]} />;
}

export function ProfilePage() {
  return (
    <div className="panel max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-2 text-sm text-slate-500">Profile update, avatar upload, password change, and theme preference controls are available in this admin workspace.</p>
    </div>
  );
}
