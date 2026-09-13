require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const replenishmentRoutes = require("./routes/replenishmentRoutes");
const forecastingRoutes = require("./routes/forecastingRoutes");
const purchasePlanningRoutes = require("./routes/purchasePlanningRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const usersRoutes = require("./routes/usersRoutes");
const auditLogsRoutes = require("./routes/auditLogsRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

connectDB();

const allowedOrigin =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "K-12 Optimiser backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/replenishment", replenishmentRoutes);
app.use("/api/forecasting", forecastingRoutes);
app.use("/api/purchase-planning", purchasePlanningRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/audit-logs", auditLogsRoutes);
app.use("/api/settings", settingsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});