import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import Button from "../components/Button";

const badgeClass = (st) => {
  switch (st) {
    case "Delivered":
      return "bg-green-100 text-green-700";
    case "Delayed":
      return "bg-red-100 text-red-700";
    case "OutForDelivery":
      return "bg-amber-100 text-amber-700";
    case "InTransit":
      return "bg-brand-100 text-brand-800";
    case "PickedUp":
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function Shipments() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/shipments", {
      params: { status, q, from, to },
    });
    setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const search = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-brand-700">Shipments</h1>
        <Link to="/shipments/new">
          <Button>New Shipment</Button>
        </Link>
      </div>

      <form
        onSubmit={search}
        className="bg-white rounded-2xl p-4 shadow mb-4 grid grid-cols-1 md:grid-cols-5 gap-3"
      >
        <input
          className="border rounded p-2"
          placeholder="Search (tracking/sender/receiver)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option>PickedUp</option>
          <option>InTransit</option>
          <option>OutForDelivery</option>
          <option>Delivered</option>
          <option>Delayed</option>
        </select>
        <input
          className="border rounded p-2"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          className="border rounded p-2"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Apply
        </Button>
      </form>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr className="border-b">
              <th className="p-3">Tracking</th>
              <th className="p-3">Sender</th>
              <th className="p-3">Receiver</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
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
            {!loading && rows.length === 0 && (
              <tr>
                <td className="p-3" colSpan={6}>
                  No shipments found.
                </td>
              </tr>
            )}
            {rows.map((s) => (
              <tr key={s._id} className="border-t hover:bg-brand-50/50">
                <td className="p-3 font-medium">
                  {s.trackingCode || s._id.slice(-8)}
                </td>
                <td className="p-3">{s.senderName}</td>
                <td className="p-3">{s.receiverName}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded ${badgeClass(s.status)}`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(s.createdAt).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  <Link to={`/shipments/${s._id}`}>
                    <Button variant="ghost">Open</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
