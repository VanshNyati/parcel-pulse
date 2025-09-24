require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./utils/db");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    service: "CampusExpress API",
    time: new Date().toISOString(),
  })
);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/warehouses", require("./routes/warehouses"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/shipments", require("./routes/shipments"));
app.use("/api/dashboard", require("./routes/dashboard"));

const PORT = process.env.PORT || 8080;

connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 API running at http://localhost:${PORT}`)
  );
});
