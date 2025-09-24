const router = require("express").Router();
const auth = require("../middleware/auth");
const allow = require("../middleware/rbac");
const InventoryItem = require("../models/InventoryItem");

router.get("/", auth(true), async (req, res) => {
  const { warehouseId } = req.query;
  const q = warehouseId ? { warehouseId } : {};
  const items = await InventoryItem.find(q).lean();
  res.json(items);
});

router.get("/low-stock", auth(true), async (req, res) => {
  const items = await InventoryItem.find({
    $expr: { $lte: ["$stock", "$reorderThreshold"] },
  })
    .select("name stock reorderThreshold warehouseId")
    .lean();
  res.json(items);
});

router.post("/", auth(true), allow(["Admin", "Manager"]), async (req, res) => {
  const item = await InventoryItem.create(req.body);
  res.json(item);
});

router.patch(
  "/:id",
  auth(true),
  allow(["Admin", "Manager"]),
  async (req, res) => {
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(item);
  }
);

router.delete("/:id", auth(true), allow(["Admin"]), async (req, res) => {
  await InventoryItem.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
