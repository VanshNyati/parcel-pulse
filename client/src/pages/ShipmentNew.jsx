import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";

export default function ShipmentNew() {
  const nav = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({
    trackingCode: "",
    senderName: "",
    senderPhone: "",
    receiverName: "",
    receiverPhone: "",
    originWarehouseId: "",
    destinationWarehouseId: "",
    originAddress: "",
    destinationAddress: "",
    status: "PickedUp",
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/warehouses").then((r) => setWarehouses(r.data));
  }, []);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/shipments", form);
      nav(`/shipments/${data._id}`);
    } catch (e) {
      setErr("Failed to create shipment. Check required fields and role.");
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-brand-700 mb-4">
        Create Shipment
      </h1>
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl p-5 shadow grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {err && <div className="md:col-span-2 text-red-600 text-sm">{err}</div>}

        <Input
          label="Tracking Code"
          value={form.trackingCode}
          onChange={(v) => set("trackingCode", v)}
        />
        <Select
          label="Status"
          value={form.status}
          onChange={(v) => set("status", v)}
          options={[
            "PickedUp",
            "InTransit",
            "OutForDelivery",
            "Delivered",
            "Delayed",
          ]}
        />

        <Input
          label="Sender Name"
          value={form.senderName}
          onChange={(v) => set("senderName", v)}
        />
        <Input
          label="Sender Phone"
          value={form.senderPhone}
          onChange={(v) => set("senderPhone", v)}
        />

        <Input
          label="Receiver Name"
          value={form.receiverName}
          onChange={(v) => set("receiverName", v)}
        />
        <Input
          label="Receiver Phone"
          value={form.receiverPhone}
          onChange={(v) => set("receiverPhone", v)}
        />

        <Select
          label="Origin Warehouse"
          value={form.originWarehouseId}
          onChange={(v) => set("originWarehouseId", v)}
          options={warehouses.map((w) => ({ label: w.name, value: w._id }))}
        />
        <Select
          label="Destination Warehouse"
          value={form.destinationWarehouseId}
          onChange={(v) => set("destinationWarehouseId", v)}
          options={warehouses.map((w) => ({ label: w.name, value: w._id }))}
        />

        <Input
          label="Origin Address"
          value={form.originAddress}
          onChange={(v) => set("originAddress", v)}
        />
        <Input
          label="Destination Address"
          value={form.destinationAddress}
          onChange={(v) => set("destinationAddress", v)}
        />

        <div className="md:col-span-2 flex justify-end">
          <button className="bg-brand-600 text-white px-5 py-2 rounded">
            Create
          </button>
        </div>
      </form>
    </Layout>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="text-sm">
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

function Select({ label, value, onChange, options }) {
  const opts =
    options?.map((o) => (typeof o === "string" ? { label: o, value: o } : o)) ||
    [];
  return (
    <label className="text-sm">
      <div className="text-gray-600 mb-1">{label}</div>
      <select
        className="border rounded w-full p-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select…</option>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
