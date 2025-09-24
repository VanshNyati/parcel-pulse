const router = require("express").Router();
const auth = require("../middleware/auth");
const allow = require("../middleware/rbac");
const User = require("../models/User");

router.get("/", auth(true), allow(["Admin"]), async (req, res) => {
  const users = await User.find().select("-passwordHash").lean();
  res.json(users);
});

router.patch("/:id", auth(true), allow(["Admin"]), async (req, res) => {
  const { role, name } = req.body;
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { ...(role && { role }), ...(name && { name }) },
    { new: true }
  ).select("-passwordHash");
  res.json(updated);
});

module.exports = router;
