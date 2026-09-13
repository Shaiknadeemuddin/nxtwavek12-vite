const express = require("express");

const {
  getUsers,
  createUser,
  updateUserStatus,
  getProfile,
  updateProfile,
} = require("../controllers/usersController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  validateUserId,
  validateCreateUser,
  validateUserStatus,
  validateProfileUpdate,
} = require("../middleware/userValidation");

const router = express.Router();

// Users & Roles management
router.get(
  "/",
  authMiddleware,
  roleMiddleware("Procurement Manager"),
  getUsers
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("Procurement Manager"),
  validateCreateUser,
  createUser
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("Procurement Manager"),
  validateUserId,
  validateUserStatus,
  updateUserStatus
);

// Profile access
router.get(
  "/:id/profile",
  authMiddleware,
  validateUserId,
  getProfile
);

router.put(
  "/:id/profile",
  authMiddleware,
  validateUserId,
  validateProfileUpdate,
  updateProfile
);

module.exports = router;