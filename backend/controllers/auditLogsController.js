const AuditLog = require("../models/AuditLog");

/* =========================
   GET AUDIT LOGS
========================= */

const getAuditLogs = async (req, res) => {
  try {
    let auditLogs = await AuditLog.find().sort({ createdAt: 1 });

    if (auditLogs.length === 0) {
      auditLogs = await AuditLog.insertMany([
        {
          user: "Rahul Sharma",
          role: "Procurement Manager",
          action: "Approval",
          resource: "Purchase Recommendation #PR-1024",
          timestamp: new Date(),
          status: "Success",
        },
        {
          user: "Priya Reddy",
          role: "Inventory Planner",
          action: "AI Execution",
          resource: "Demand Forecast - Grade 8",
          timestamp: new Date(),
          status: "Success",
        },
        {
          user: "Arjun Kumar",
          role: "Warehouse User",
          action: "Update",
          resource: "Science Lab Kit Stock",
          timestamp: new Date(),
          status: "Success",
        },
        {
          user: "Sneha Patel",
          role: "Finance Reviewer",
          action: "Export",
          resource: "Purchase Planning Report",
          timestamp: new Date(),
          status: "Success",
        },
        {
          user: "Rahul Sharma",
          role: "Procurement Manager",
          action: "Override",
          resource: "Student Laptop Recommendation",
          timestamp: new Date(),
          status: "Success",
        },
        {
          user: "Priya Reddy",
          role: "Inventory Planner",
          action: "Create",
          resource: "Replenishment Recommendation #RP-208",
          timestamp: new Date(),
          status: "Success",
        },
        {
          user: "Vikram Singh",
          role: "Supplier",
          action: "Data Access",
          resource: "Supplier Order #SO-884",
          timestamp: new Date(),
          status: "Success",
        },
        {
          user: "Rahul Sharma",
          role: "Procurement Manager",
          action: "Rejection",
          resource: "Purchase Recommendation #PR-1019",
          timestamp: new Date(),
          status: "Success",
        },
        {
          user: "System",
          role: "System",
          action: "Authentication",
          resource: "User Login",
          timestamp: new Date(),
          status: "Success",
        },
        {
          user: "Admin",
          role: "Administrator",
          action: "Config",
          resource: "Safety Stock Configuration",
          timestamp: new Date(),
          status: "Success",
        },
      ]);

      auditLogs = auditLogs.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
    }

    const totalEvents = auditLogs.length;

    const aiEvents = auditLogs.filter(
      (log) =>
        log.action === "AI Execution" ||
        log.action === "Override"
    ).length;

    const approvals = auditLogs.filter(
      (log) =>
        log.action === "Approval" ||
        log.action === "Rejection"
    ).length;

    const successfulEvents = auditLogs.filter(
      (log) => log.status === "Success"
    ).length;

    res.status(200).json({
      message: "Audit logs fetched successfully.",
      data: {
        kpis: {
          totalEvents,
          aiEvents,
          approvals,
          successfulEvents,
        },
        auditLogs,
      },
    });
  } catch (error) {
    console.error("Audit logs error:", error);

    res.status(500).json({
      message: "Unable to fetch audit logs.",
    });
  }
};

/* =========================
   CREATE AUDIT LOG
========================= */

const createAuditLog = async (req, res) => {
  try {
    const {
      user,
      role,
      action,
      resource,
      status = "Success",
    } = req.body;

    if (!user || !role || !action || !resource) {
      return res.status(400).json({
        message:
          "User, role, action and resource are required.",
      });
    }

    const auditLog = await AuditLog.create({
      user,
      role,
      action,
      resource,
      status,
      timestamp: new Date(),
    });

    res.status(201).json({
      message: "Audit log created successfully.",
      data: auditLog,
    });
  } catch (error) {
    console.error("Create audit log error:", error);

    res.status(500).json({
      message: "Unable to create audit log.",
    });
  }
};

module.exports = {
  getAuditLogs,
  createAuditLog,
};