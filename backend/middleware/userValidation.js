const { body, param, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Invalid request data.",
      errors: errors.array(),
    });
  }

  next();
};

const validateUserId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid user ID."),

  handleValidationErrors,
];

const validateCreateUser = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email address is required.")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6, max: 100 })
    .withMessage("Password must be between 6 and 100 characters."),

  body("role")
    .isIn([
      "Procurement Manager",
      "Inventory Planner",
      "Warehouse User",
      "Finance Reviewer",
      "Supplier",
    ])
    .withMessage("Invalid user role."),

  handleValidationErrors,
];

const validateUserStatus = [
  body("status")
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive."),

  handleValidationErrors,
];

const validateProfileUpdate = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email address is required.")
    .normalizeEmail(),

  body("profileImage")
    .optional()
    .isString()
    .withMessage("Profile image must be a string."),

  handleValidationErrors,
];

module.exports = {
  validateUserId,
  validateCreateUser,
  validateUserStatus,
  validateProfileUpdate,
};