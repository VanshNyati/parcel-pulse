import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard/metrics").then((r) => setData(r.data));
  }, []);

  if (!data)
    return (
      <Layout>
        <div>Loading…</div>
      </Layout>
    );
  const { totals, lowStock, recentEvents } = data;

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-brand-700">
        Operations Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card title="In Transit" value={totals.inTransit} />
        <Card title="Delivered" value={totals.delivered} />
        <Card title="Delayed" value={totals.delayed} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-2xl p-4 shadow">
          <h2 className="font-semibold mb-2">Low Stock Alerts</h2>
          <ul className="space-y-1 text-sm">
            {lowStock.map((i) => (
              <li key={i._id}>
                <span className="font-medium">{i.name}</span> — {i.stock}/
                {i.reorderThreshold}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow">
          <h2 className="font-semibold mb-2">Recent Shipment Events</h2>
          <ul className="space-y-1 text-sm">
            {recentEvents.map((e) => (
              <li key={e._id}>
                {new Date(e.occurredAt).toLocaleString()} — {e.status}{" "}
                {e.note ? `(${e.note})` : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-3xl font-bold text-brand-700">{value}</div>
    </div>
  );
}
