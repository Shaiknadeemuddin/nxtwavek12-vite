const express = require("express");

const {
  getDashboard,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "Procurement Manager",
    "Inventory Planner",
    "Warehouse User",
    "Finance Reviewer"
  ),
  getDashboard
);

module.exports = router;