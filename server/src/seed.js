require("dotenv").config();
const connectDB = require("./utils/db");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Warehouse = require("./models/Warehouse");
const InventoryItem = require("./models/InventoryItem");
const Shipment = require("./models/Shipment");
const ShipmentEvent = require("./models/ShipmentEvent");

(async () => {
  await connectDB(process.env.MONGO_URI);

  await Promise.all([
    User.deleteMany({}),
    Warehouse.deleteMany({}),
    InventoryItem.deleteMany({}),
    Shipment.deleteMany({}),
    ShipmentEvent.deleteMany({}),
  ]);

  const pwd = await bcrypt.hash("Admin@123", 10);
  const [admin, manager, staff] = await User.insertMany([
    { name: "Admin", email: "admin@cx.com", passwordHash: pwd, role: "Admin" },
    {
      name: "Manager",
      email: "manager@cx.com",
      passwordHash: pwd,
      role: "Manager",
    },
    {
      name: "Staff",
      email: "staff@cx.com",
      passwordHash: pwd,
      role: "WarehouseStaff",
    },
  ]);

  const [wh1, wh2] = await Warehouse.insertMany([
    { name: "Gurugram WH", city: "Gurugram", state: "HR", capacity: 1000 },
    { name: "Bengaluru WH", city: "Bengaluru", state: "KA", capacity: 800 },
  ]);

  await InventoryItem.insertMany([
    {
      sku: "BOX-L",
      name: "Large Boxes",
      unit: "pcs",
      stock: 40,
      reorderThreshold: 50,
      warehouseId: wh1._id,
    },
    {
      sku: "TAPE-CLR",
      name: "Clear Tape",
      unit: "rolls",
      stock: 12,
      reorderThreshold: 15,
      warehouseId: wh1._id,
    },
    {
      sku: "LBL-A4",
      name: "Shipping Labels",
      unit: "sheets",
      stock: 300,
      reorderThreshold: 200,
      warehouseId: wh2._id,
    },
  ]);

  const s1 = await Shipment.create({
    trackingCode: "CX-1001",
    senderName: "Vansh",
    receiverName: "Campus Express",
    originWarehouseId: wh1._id,
    destinationWarehouseId: wh2._id,
    originAddress: "Gurugram",
    destinationAddress: "Bengaluru",
    status: "InTransit",
  });

  await ShipmentEvent.create({
    shipmentId: s1._id,
    status: "PickedUp",
    note: "Picked up",
  });
  await ShipmentEvent.create({
    shipmentId: s1._id,
    status: "InTransit",
    note: "Left origin hub",
  });

  console.log("✅ Seeded.\nAdmin: admin@cx.com / Admin@123");
  process.exit(0);
})();
