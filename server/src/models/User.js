const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, index: true },
    passwordHash: String,
    role: {
      type: String,
      enum: ["Admin", "Manager", "WarehouseStaff"],
      default: "WarehouseStaff",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
