const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    city: String,
    state: String,
    lat: Number,
    lon: Number,
    capacity: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Warehouse", warehouseSchema);
