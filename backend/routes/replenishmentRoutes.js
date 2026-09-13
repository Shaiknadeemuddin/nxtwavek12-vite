const express = require("express");

const {
  getReplenishment,
} = require("../controllers/replenishmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "Procurement Manager",
    "Inventory Planner",
    "Warehouse User"
  ),
  getReplenishment
);

module.exports = router;