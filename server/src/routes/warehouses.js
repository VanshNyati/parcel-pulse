const router = require("express").Router();
const auth = require("../middleware/auth");
const allow = require("../middleware/rbac");
const Warehouse = require("../models/Warehouse");

router.get("/", auth(true), async (req, res) => {
  res.json(await Warehouse.find().lean());
});

router.post("/", auth(true), allow(["Admin", "Manager"]), async (req, res) => {
  res.json(await Warehouse.create(req.body));
});

router.patch(
  "/:id",
  auth(true),
  allow(["Admin", "Manager"]),
  async (req, res) => {
    res.json(
      await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true })
    );
  }
);

router.delete("/:id", auth(true), allow(["Admin"]), async (req, res) => {
  await Warehouse.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
