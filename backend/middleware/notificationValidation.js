const { param, validationResult } = require("express-validator");

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

const validateNotificationId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid notification ID."),

  handleValidationErrors,
];

module.exports = {
  validateNotificationId,
};