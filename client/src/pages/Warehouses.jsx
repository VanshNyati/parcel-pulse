import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import { toast } from "react-hot-toast";

export default function Warehouses() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank());
  const [editingId, setEditingId] = useState("");
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState(null); // { id, name }

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
    const errs = validate(form);
    if (errs.length) {
      toast.error(errs[0]);
      return;
    }
    try {
      if (editingId) await api.patch(`/warehouses/${editingId}`, form);
      else await api.post("/warehouses", form);
      cancelEdit();
      await load();
      toast.success(editingId ? "Warehouse updated" : "Warehouse created");
    } catch {
      setErr("Failed to save. Only Admin/Manager can create/edit.");
    }
  };

  const requestDelete = (w) => setConfirm({ id: w._id, name: w.name });
  const performDelete = async () => {
    if (!confirm?.id) return;
    try {
      await api.delete(`/warehouses/${confirm.id}`);
      setConfirm(null);
      await load();
      toast.success("Warehouse deleted");
    } catch {
      setConfirm(null);
      toast.error("Delete failed");
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-brand-700">Warehouses</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Button variant="ghost" onClick={() => startEdit(w)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => requestDelete(w)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
              <Button type="submit">{editingId ? "Save" : "Create"}</Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title="Delete warehouse?"
        message={`Delete “${confirm?.name ?? ""}”? This cannot be undone.`}
        onCancel={() => setConfirm(null)}
        onConfirm={performDelete}
      />
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

function validate(f) {
  const out = [];
  const req = (v) => v && String(v).trim().length > 0;
  const nonneg = (n) => Number.isFinite(+n) && +n >= 0;
  if (!req(f.name)) out.push("Name is required");
  if (!nonneg(f.capacity)) out.push("Capacity must be ≥ 0");
  return out;
}
