const { body, validationResult } = require("express-validator");

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

const validateCreateAuditLog = [
  body("user")
    .trim()
    .notEmpty()
    .withMessage("User is required.")
    .isLength({ max: 100 })
    .withMessage("User cannot exceed 100 characters."),

  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required.")
    .isLength({ max: 100 })
    .withMessage("Role cannot exceed 100 characters."),

  body("action")
    .trim()
    .notEmpty()
    .withMessage("Action is required.")
    .isLength({ max: 100 })
    .withMessage("Action cannot exceed 100 characters."),

  body("resource")
    .trim()
    .notEmpty()
    .withMessage("Resource is required.")
    .isLength({ max: 200 })
    .withMessage("Resource cannot exceed 200 characters."),

  body("status")
    .optional()
    .isIn(["Success", "Failed"])
    .withMessage("Status must be Success or Failed."),

  handleValidationErrors,
];

module.exports = {
  validateCreateAuditLog,
};