const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    trackingCode: { type: String, index: true },
    senderName: String,
    senderPhone: String,
    receiverName: String,
    receiverPhone: String,
    originWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    destinationWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    originAddress: String,
    destinationAddress: String,
    status: {
      type: String,
      enum: ["PickedUp", "InTransit", "OutForDelivery", "Delivered", "Delayed"],
      default: "PickedUp",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);
