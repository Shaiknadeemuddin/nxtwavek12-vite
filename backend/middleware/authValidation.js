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

const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("A valid email address is required.")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6, max: 100 })
    .withMessage("Password must be between 6 and 100 characters."),

  handleValidationErrors,
];

module.exports = {
  validateLogin,
};