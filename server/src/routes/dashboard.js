const router = require("express").Router();
const auth = require("../middleware/auth");
const Shipment = require("../models/Shipment");
const InventoryItem = require("../models/InventoryItem");
const ShipmentEvent = require("../models/ShipmentEvent");

router.get("/metrics", auth(true), async (req, res) => {
  const [inTransit, delivered, delayed] = await Promise.all([
    Shipment.countDocuments({ status: "InTransit" }),
    Shipment.countDocuments({ status: "Delivered" }),
    Shipment.countDocuments({ status: "Delayed" }),
  ]);
  const lowStock = await InventoryItem.find({
    $expr: { $lte: ["$stock", "$reorderThreshold"] },
  })
    .select("name stock reorderThreshold warehouseId")
    .limit(10)
    .lean();
  const recentEvents = await ShipmentEvent.find()
    .sort({ occurredAt: -1 })
    .limit(10)
    .lean();
  res.json({
    totals: { inTransit, delivered, delayed },
    lowStock,
    recentEvents,
  });
});

module.exports = router;
