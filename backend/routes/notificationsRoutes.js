const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotification,
} = require("../controllers/notificationsController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  validateNotificationId,
} = require("../middleware/notificationValidation");

const router = express.Router();

const notificationRoles = [
  "Procurement Manager",
  "Inventory Planner",
  "Warehouse User",
  "Finance Reviewer",
];

// Get notifications
router.get(
  "/",
  authMiddleware,
  roleMiddleware(...notificationRoles),
  getNotifications
);

// Mark one notification as read
router.patch(
  "/:id/read",
  authMiddleware,
  roleMiddleware(...notificationRoles),
  validateNotificationId,
  markNotificationAsRead
);

// Mark all notifications as read
router.patch(
  "/read-all",
  authMiddleware,
  roleMiddleware(...notificationRoles),
  markAllNotificationsAsRead
);

// Clear notification
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(...notificationRoles),
  validateNotificationId,
  clearNotification
);

module.exports = router;