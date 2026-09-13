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

const validateSettingsUpdate = [
  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Company name is required.")
    .isLength({ max: 150 })
    .withMessage("Company name cannot exceed 150 characters."),

  body("defaultLocation")
    .trim()
    .notEmpty()
    .withMessage("Default location is required.")
    .isLength({ max: 150 })
    .withMessage("Default location cannot exceed 150 characters."),

  body("planningHorizon")
    .trim()
    .notEmpty()
    .withMessage("Planning horizon is required.")
    .isLength({ max: 50 })
    .withMessage("Planning horizon cannot exceed 50 characters."),

  body("serviceLevel")
    .trim()
    .notEmpty()
    .withMessage("Service level is required.")
    .isLength({ max: 50 })
    .withMessage("Service level cannot exceed 50 characters."),

  body("notifications")
    .isBoolean()
    .withMessage("Notifications must be true or false."),

  body("emailAlerts")
    .isBoolean()
    .withMessage("Email alerts must be true or false."),

  body("aiRecommendations")
    .isBoolean()
    .withMessage("AI recommendations must be true or false."),

  handleValidationErrors,
];

module.exports = {
  validateSettingsUpdate,
};