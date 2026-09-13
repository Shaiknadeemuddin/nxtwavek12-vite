const express = require("express");

const {
  getPurchasePlanning,
  approvePurchaseRecommendation,
  rejectPurchaseRecommendation,
  deferPurchaseRecommendation,
  overridePurchaseRecommendation,
} = require("../controllers/purchasePlanningController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  validateRecommendationId,
  validateReason,
  validateOverride,
} = require("../middleware/purchasePlanningValidation");

const router = express.Router();

// View Purchase Planning
router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "Procurement Manager",
    "Inventory Planner",
    "Finance Reviewer"
  ),
  getPurchasePlanning
);

// Approve Purchase Recommendation
router.patch(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("Procurement Manager"),
  validateRecommendationId,
  approvePurchaseRecommendation
);

// Reject Purchase Recommendation
router.patch(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("Procurement Manager"),
  validateRecommendationId,
  validateReason,
  rejectPurchaseRecommendation
);

// Defer Purchase Recommendation
router.patch(
  "/:id/defer",
  authMiddleware,
  roleMiddleware("Procurement Manager"),
  validateRecommendationId,
  validateReason,
  deferPurchaseRecommendation
);

// Override Purchase Recommendation
router.patch(
  "/:id/override",
  authMiddleware,
  roleMiddleware("Procurement Manager"),
  validateRecommendationId,
  validateOverride,
  overridePurchaseRecommendation
);

module.exports = router;