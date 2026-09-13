const express = require("express");

const {
  getAuditLogs,
  createAuditLog,
} = require("../controllers/auditLogsController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  validateCreateAuditLog,
} = require("../middleware/auditLogValidation");

const router = express.Router();

// View audit logs
router.get(
  "/",
  authMiddleware,
  roleMiddleware("Procurement Manager"),
  getAuditLogs
);

// Create audit log
router.post(
  "/",
  authMiddleware,
  roleMiddleware("Procurement Manager"),
  validateCreateAuditLog,
  createAuditLog
);

module.exports = router;