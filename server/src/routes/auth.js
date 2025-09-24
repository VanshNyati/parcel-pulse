const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

router.post("/register", async (req, res) => {
  const { name, email, password, role = "WarehouseStaff" } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email in use" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });
  res.json({ id: user._id });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign(
    { id: user._id, role: user.role, email },
    process.env.JWT_SECRET,
    {
      expiresIn: "2d",
    }
  );
  res.json({
    token,
    user: { id: user._id, name: user.name, email, role: user.role },
  });
});

router.get("/me", auth(true), async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

module.exports = router;
