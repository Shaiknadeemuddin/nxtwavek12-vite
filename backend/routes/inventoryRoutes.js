const express = require("express");

const {
  getInventory,
  getInventoryItem,
} = require("../controllers/inventoryController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  validateRecommendationId,
} = require("../middleware/purchasePlanningValidation");

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
  getInventory
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "Procurement Manager",
    "Inventory Planner",
    "Warehouse User",
    "Finance Reviewer"
  ),
  validateRecommendationId,
  getInventoryItem
);

module.exports = router;