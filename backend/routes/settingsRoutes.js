const express = require("express");

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  validateSettingsUpdate,
} = require("../middleware/settingsValidation");

const router = express.Router();

// View settings
router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "Procurement Manager",
    "Inventory Planner"
  ),
  getSettings
);

// Update settings — Procurement Manager only
router.put(
  "/",
  authMiddleware,
  roleMiddleware("Procurement Manager"),
  validateSettingsUpdate,
  updateSettings
);

module.exports = router;