import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { toast } from "react-hot-toast";

export default function ShipmentDetail() {
  const { id } = useParams();
  const [s, setS] = useState(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    const { data } = await api.get(`/shipments/${id}`);
    setS(data);
    setStatus(data.status);
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await api.post(`/shipments/${id}/status`, { status, note });
      setNote("");
      await load();
      toast.success("Shipment status updated");
    } catch {
      setErr("Failed to update status. Check your role.");
    }
  };

  if (!s)
    return (
      <Layout>
        <div>Loading…</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-brand-700">
          Shipment #{s.trackingCode || s._id.slice(-8)}
        </h1>
        <Link to="/shipments">
          <Button variant="ghost">Back to list</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-2xl p-4 shadow">
          <h2 className="font-semibold mb-3">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <Field k="Sender" v={s.senderName} />
            <Field k="Receiver" v={s.receiverName} />
            <Field k="Origin" v={s.originAddress} />
            <Field k="Destination" v={s.destinationAddress} />
            <Field k="Status" v={s.status} />
            <Field k="Created" v={new Date(s.createdAt).toLocaleString()} />
          </div>

          <h2 className="font-semibold mt-6 mb-2">Timeline</h2>
          <ul className="text-sm space-y-2">
            {s.events?.length === 0 && <li>No events yet.</li>}
            {s.events?.map((e) => (
              <li key={e._id} className="border rounded p-2">
                <div className="font-medium">{e.status}</div>
                <div className="text-gray-600">
                  {new Date(e.occurredAt).toLocaleString()}
                </div>
                {e.note && <div className="text-gray-700">{e.note}</div>}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow">
          <h2 className="font-semibold mb-3">Update Status</h2>
          {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
          <form onSubmit={updateStatus} className="space-y-3 text-sm">
            <label className="block">
              <div className="text-gray-600 mb-1">Status</div>
              <select
                className="border rounded w-full p-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>PickedUp</option>
                <option>InTransit</option>
                <option>OutForDelivery</option>
                <option>Delivered</option>
                <option>Delayed</option>
              </select>
            </label>
            <label className="block">
              <div className="text-gray-600 mb-1">Note (optional)</div>
              <input
                className="border rounded w-full p-2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <Button type="submit">Save</Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

function Field({ k, v }) {
  return (
    <div>
      <div className="text-gray-500">{k}</div>
      <div className="font-medium">{v || "-"}</div>
    </div>
  );
}
