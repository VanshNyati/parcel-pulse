import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import { toast } from "react-hot-toast";

export default function Inventory() {
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank());
  const [editingId, setEditingId] = useState("");
  const [lowStockIds, setLowStockIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState(null); // { id, name }

  function blank() {
    return {
      sku: "",
      name: "",
      unit: "",
      stock: 0,
      reorderThreshold: 0,
      warehouseId: "",
    };
  }

  const loadWarehouses = async () => {
    const { data } = await api.get("/warehouses");
    setWarehouses(data);
    if (!warehouseId && data[0]?._id) setWarehouseId(data[0]._id);
  };

  const loadItems = async () => {
    setLoading(true);
    const { data } = await api.get("/inventory", { params: { warehouseId } });
    setItems(data);
    setLoading(false);
  };

  const loadLowStock = async () => {
    const { data } = await api.get("/inventory/low-stock");
    setLowStockIds(new Set(data.map((i) => i._id)));
  };

  useEffect(() => {
    loadWarehouses();
  }, []);
  useEffect(() => {
    if (warehouseId) {
      loadItems();
      loadLowStock();
    }
  }, [warehouseId]);

  const startEdit = (it) => {
    setEditingId(it._id);
    setForm({
      sku: it.sku || "",
      name: it.name || "",
      unit: it.unit || "",
      stock: it.stock ?? 0,
      reorderThreshold: it.reorderThreshold ?? 0,
      warehouseId: it.warehouseId || warehouseId,
    });
  };

  const cancelEdit = () => {
    setEditingId("");
    setForm(blank());
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const errs = validate(form, warehouseId);
    if (errs.length) {
      toast.error(errs[0]);
      return;
    }
    try {
      if (!form.warehouseId) form.warehouseId = warehouseId;
      if (editingId) await api.patch(`/inventory/${editingId}`, form);
      else await api.post("/inventory", form);
      cancelEdit();
      await loadItems();
      await loadLowStock();
      toast.success(editingId ? "Item updated" : "Item created");
    } catch {
      setErr("Failed to save item. Check required fields and role.");
    }
  };

  const requestDelete = (it) => setConfirm({ id: it._id, name: it.name });
  const performDelete = async () => {
    if (!confirm?.id) return;
    try {
      await api.delete(`/inventory/${confirm.id}`);
      setConfirm(null);
      await loadItems();
      await loadLowStock();
      toast.success("Item deleted");
    } catch {
      setConfirm(null);
      toast.error("Delete failed");
    }
  };

  const currentWarehouseName = useMemo(
    () => warehouses.find((w) => w._id === warehouseId)?.name || "",
    [warehouses, warehouseId]
  );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-brand-700">Inventory</h1>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow mb-4 flex flex-wrap gap-3 items-center">
        <label className="text-sm">
          <div className="text-gray-600 mb-1">Warehouse</div>
          <select
            className="border rounded p-2 min-w-[250px]"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
          >
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
        <div className="text-gray-500 text-sm">
          Items at <span className="font-medium">{currentWarehouseName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-2xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr className="border-b">
                <th className="p-3">SKU</th>
                <th className="p-3">Name</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Reorder ≤</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="p-3" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td className="p-3" colSpan={6}>
                    No items found.
                  </td>
                </tr>
              )}
              {items.map((it) => {
                const isLow = lowStockIds.has(it._id);
                return (
                  <tr key={it._id} className="border-t hover:bg-brand-50/50">
                    <td className="p-3 font-medium">{it.sku}</td>
                    <td className="p-3">{it.name}</td>
                    <td className="p-3">{it.unit}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded ${
                          isLow
                            ? "bg-red-100 text-red-700"
                            : "bg-brand-100 text-brand-800"
                        }`}
                      >
                        {it.stock}
                      </span>
                    </td>
                    <td className="p-3">{it.reorderThreshold}</td>
                    <td className="p-3 text-right space-x-2">
                      <Button variant="ghost" onClick={() => startEdit(it)}>
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => requestDelete(it)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow">
          <h2 className="font-semibold mb-3">
            {editingId ? "Edit Item" : "Add Item"}
          </h2>
          {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
          <form onSubmit={submit} className="space-y-3 text-sm">
            <Input
              label="SKU"
              value={form.sku}
              onChange={(v) => setForm((f) => ({ ...f, sku: v }))}
            />
            <Input
              label="Name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <Input
              label="Unit"
              value={form.unit}
              onChange={(v) => setForm((f) => ({ ...f, unit: v }))}
            />
            <Input
              type="number"
              label="Stock"
              value={form.stock}
              onChange={(v) => setForm((f) => ({ ...f, stock: Number(v) }))}
            />
            <Input
              type="number"
              label="Reorder Threshold"
              value={form.reorderThreshold}
              onChange={(v) =>
                setForm((f) => ({ ...f, reorderThreshold: Number(v) }))
              }
            />
            <label className="block">
              <div className="text-gray-600 mb-1">Warehouse</div>
              <select
                className="border rounded w-full p-2"
                value={form.warehouseId || warehouseId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, warehouseId: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
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
        title="Delete item?"
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

function validate(f, fallbackWarehouseId) {
  const out = [];
  const req = (v) => v && String(v).trim().length > 0;
  const nonneg = (n) => Number.isFinite(+n) && +n >= 0;
  if (!req(f.sku)) out.push("SKU is required");
  if (!req(f.name)) out.push("Name is required");
  if (!req(f.unit)) out.push("Unit is required");
  if (!nonneg(f.stock)) out.push("Stock must be ≥ 0");
  if (!nonneg(f.reorderThreshold)) out.push("Reorder Threshold must be ≥ 0");
  if (!req(f.warehouseId || fallbackWarehouseId))
    out.push("Warehouse is required");
  return out;
}
