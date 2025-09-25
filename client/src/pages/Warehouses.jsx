import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

export default function Warehouses() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank());
  const [editingId, setEditingId] = useState("");
  const [err, setErr] = useState("");

  function blank() {
    return { name: "", address: "", city: "", state: "", capacity: 0 };
  }

  const load = async () => {
    const { data } = await api.get("/warehouses");
    setRows(data);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (w) => {
    setEditingId(w._id);
    setForm({
      name: w.name || "",
      address: w.address || "",
      city: w.city || "",
      state: w.state || "",
      capacity: w.capacity ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingId("");
    setForm(blank());
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      if (editingId) {
        await api.patch(`/warehouses/${editingId}`, form);
      } else {
        await api.post("/warehouses", form);
      }
      cancelEdit();
      await load();
    } catch {
      setErr("Failed to save. Only Admin/Manager can create/edit.");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this warehouse?")) return;
    try {
      await api.delete(`/warehouses/${id}`);
      await load();
    } catch {
      alert(
        "Delete failed. Only Admin can delete, or it might be referenced by items/shipments."
      );
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-brand-700">Warehouses</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* List */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr className="border-b">
                <th className="p-3">Name</th>
                <th className="p-3">Location</th>
                <th className="p-3">Capacity</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className="p-3" colSpan={4}>
                    No warehouses yet.
                  </td>
                </tr>
              )}
              {rows.map((w) => (
                <tr key={w._id} className="border-t hover:bg-brand-50/50">
                  <td className="p-3 font-medium">{w.name}</td>
                  <td className="p-3">
                    {[w.address, w.city, w.state].filter(Boolean).join(", ")}
                  </td>
                  <td className="p-3">{w.capacity || "-"}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => startEdit(w)}
                      className="text-brand-700 underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => del(w._id)}
                      className="text-red-600 underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <h2 className="font-semibold mb-3">
            {editingId ? "Edit Warehouse" : "Add Warehouse"}
          </h2>
          {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
          <form onSubmit={submit} className="space-y-3 text-sm">
            <Input
              label="Name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(v) => setForm((f) => ({ ...f, address: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                value={form.city}
                onChange={(v) => setForm((f) => ({ ...f, city: v }))}
              />
              <Input
                label="State"
                value={form.state}
                onChange={(v) => setForm((f) => ({ ...f, state: v }))}
              />
            </div>
            <Input
              type="number"
              label="Capacity"
              value={form.capacity}
              onChange={(v) => setForm((f) => ({ ...f, capacity: Number(v) }))}
            />
            <div className="flex gap-2">
              <button className="bg-brand-600 text-white px-4 py-2 rounded">
                {editingId ? "Save" : "Create"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block text-sm">
      <div className="text-gray-600 mb-1">{label}</div>
      <input
        className="border rounded w-full p-2"
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
