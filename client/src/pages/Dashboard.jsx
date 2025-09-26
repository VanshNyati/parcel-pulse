import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

// Purple palette (tweaked to match “brand” vibe)
const PURPLE = "#7c3aed"; // primary
const PURPLE_LIGHT = "#c4b5fd"; // secondary
const PURPLE_DARK = "#5b21b6"; // accents/borders

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard/metrics").then((r) => setData(r.data));
  }, []);

  // keep hooks above any returns
  const eventsByStatus = useMemo(() => {
    if (!data?.recentEvents) return [];
    const map = {};
    for (const e of data.recentEvents) {
      map[e.status] = (map[e.status] || 0) + 1;
    }
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [data?.recentEvents]);

  const lowStockBars = useMemo(() => {
    if (!data?.lowStock) return [];
    return data.lowStock.map((i) => ({
      name: i.name,
      stock: i.stock,
      reorder: i.reorderThreshold,
    }));
  }, [data?.lowStock]);

  if (!data) {
    return (
      <Layout>
        <div>Loading…</div>
      </Layout>
    );
  }

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

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Events by Status */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <h3 className="font-semibold mb-3">Events by Status (recent)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9e0ff" />
                <XAxis dataKey="status" stroke={PURPLE_DARK} />
                <YAxis allowDecimals={false} stroke={PURPLE_DARK} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Count"
                  fill={PURPLE}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock vs Reorder */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <h3 className="font-semibold mb-3">Low Stock vs Reorder</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={lowStockBars}
                layout="vertical"
                margin={{ left: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e9e0ff" />
                <XAxis type="number" stroke={PURPLE_DARK} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  stroke={PURPLE_DARK}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="reorder"
                  name="Reorder threshold"
                  fill={PURPLE_LIGHT}
                  radius={[0, 6, 6, 0]}
                />
                <Bar
                  dataKey="stock"
                  name="Current stock"
                  fill={PURPLE}
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
