const router = require("express").Router();
const auth = require("../middleware/auth");
const allow = require("../middleware/rbac");
const Shipment = require("../models/Shipment");
const ShipmentEvent = require("../models/ShipmentEvent");

router.get("/", auth(true), async (req, res) => {
  const { status, q, from, to } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q)
    filter.$or = [
      { trackingCode: new RegExp(q, "i") },
      { senderName: new RegExp(q, "i") },
      { receiverName: new RegExp(q, "i") },
    ];
  if (from || to)
    filter.createdAt = {
      ...(from && { $gte: new Date(from) }),
      ...(to && { $lte: new Date(to) }),
    };
  const data = await Shipment.find(filter).sort({ createdAt: -1 }).lean();
  res.json(data);
});

router.post("/", auth(true), allow(["Admin", "Manager"]), async (req, res) => {
  const s = await Shipment.create(req.body);
  await ShipmentEvent.create({
    shipmentId: s._id,
    status: s.status,
    note: "Created",
  });
  res.json(s);
});

router.get("/:id", auth(true), async (req, res) => {
  const s = await Shipment.findById(req.params.id).lean();
  if (!s) return res.status(404).json({ message: "Not found" });
  const events = await ShipmentEvent.find({ shipmentId: s._id })
    .sort({ occurredAt: -1 })
    .lean();
  res.json({ ...s, events });
});

// status update – centralizes write to events + current status
router.post(
  "/:id/status",
  auth(true),
  allow(["Admin", "Manager", "WarehouseStaff"]),
  async (req, res) => {
    const { status, note, lat, lon } = req.body;
    const s = await Shipment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!s) return res.status(404).json({ message: "Not found" });
    await ShipmentEvent.create({
      shipmentId: s._id,
      status,
      note,
      lat,
      lon,
      occurredAt: new Date(),
    });
    res.json(s);
  }
);

module.exports = router;
