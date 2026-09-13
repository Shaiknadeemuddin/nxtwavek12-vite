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

const validateRecommendationId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid purchase recommendation ID."),

  handleValidationErrors,
];

const validateReason = [
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason is required.")
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters."),

  handleValidationErrors,
];

const validateOverride = [
  body("quantity")
    .notEmpty()
    .withMessage("Override quantity is required.")
    .isNumeric()
    .withMessage("Override quantity must be a number.")
    .custom((value) => Number(value) >= 0)
    .withMessage("Override quantity cannot be negative."),

  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Override reason is required.")
    .isLength({ max: 500 })
    .withMessage("Override reason cannot exceed 500 characters."),

  handleValidationErrors,
];

module.exports = {
  validateRecommendationId,
  validateReason,
  validateOverride,
};