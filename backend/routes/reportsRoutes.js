const express = require("express");

const {
  getReports,
} = require("../controllers/reportsController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "Procurement Manager",
    "Inventory Planner",
    "Finance Reviewer"
  ),
  getReports
);

module.exports = router;