const express = require("express");

const {
  getForecasting,
} = require("../controllers/forecastingController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "Procurement Manager",
    "Inventory Planner"
  ),
  getForecasting
);

module.exports = router;