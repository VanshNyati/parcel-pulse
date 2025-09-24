const mongoose = require("mongoose");

const shipmentEventSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      index: true,
    },
    status: {
      type: String,
      enum: ["PickedUp", "InTransit", "OutForDelivery", "Delivered", "Delayed"],
    },
    note: String,
    lat: Number,
    lon: Number,
    occurredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShipmentEvent", shipmentEventSchema);
