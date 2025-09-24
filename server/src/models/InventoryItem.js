const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    sku: { type: String, index: true },
    name: String,
    unit: String,
    stock: { type: Number, default: 0 },
    reorderThreshold: { type: Number, default: 0 },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
