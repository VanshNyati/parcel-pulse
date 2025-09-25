import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

export default function Users() {
  const me = JSON.parse(localStorage.getItem("user") || "null");
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/users");
      setRows(data);
      setErr("");
    } catch {
      setErr("Only Admin can view users.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setRole = async (id, role) => {
    await api.patch(`/users/${id}`, { role });
    await load();
  };

  if (me?.role !== "Admin") {
    return (
      <Layout>
        <div className="text-sm text-gray-600">
          Only Admin can access this page.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-brand-700 mb-4">Users</h1>
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr className="border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="p-3" colSpan={4}>
                  No users.
                </td>
              </tr>
            )}
            {rows.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3 text-right">
                  <select
                    className="border rounded p-1"
                    value={u.role}
                    onChange={(e) => setRole(u._id, e.target.value)}
                  >
                    <option>Admin</option>
                    <option>Manager</option>
                    <option>WarehouseStaff</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
