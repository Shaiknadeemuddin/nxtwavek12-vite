const Inventory = require("../models/Inventory");
const PurchaseRecommendation = require("../models/PurchaseRecommendation");
const AuditLog = require("../models/AuditLog");

/* =========================
   GET PURCHASE PLANNING
========================= */

const getPurchasePlanning = async (req, res) => {
  try {
    const inventoryData = await Inventory.find();

    let purchaseData = await PurchaseRecommendation.find().sort({
      createdAt: 1,
    });

    /* =========================
       GENERATE RECOMMENDATIONS
    ========================= */

    if (purchaseData.length === 0) {
      const modelVersion = "Purchase-Recommendation-v1.0";
      const generatedAt = new Date();

      const recommendations = inventoryData
        .map((item) => {
          const currentStock = item.stock || 0;
          const safetyStock = item.safetyStock || 0;
          const forecastDemand = item.forecastDemand || 0;
          const leadTime = item.leadTime || 0;
          const openOrders = item.openOrders || 0;
          const reservedQuantity = item.reservedQuantity || 0;

          let quantity = 0;
          let priority = "Low";
          let status = "Recommended";
          let confidence = "Medium";
          let recommendedAction = "Review purchase recommendation";

          const requiredStock = Math.max(
            forecastDemand + safetyStock,
            safetyStock
          );

          const availableStock =
            currentStock + openOrders - reservedQuantity;

          const stockGap = requiredStock - availableStock;

          if (stockGap > 0) {
            quantity = Math.ceil(stockGap);

            if (
              currentStock < safetyStock ||
              item.status === "Critical"
            ) {
              priority = "Critical";
              status = "Pending Review";
              confidence = "High";
              recommendedAction = "Purchase immediately";
            } else if (leadTime >= 15) {
              priority = "High";
              status = "Recommended";
              confidence = "High";
              recommendedAction =
                "Plan purchase for current cycle";
            } else {
              priority = "Medium";
              status = "Recommended";
              confidence = "Medium";
              recommendedAction = "Plan purchase";
            }
          }

          let supplier = "General Supplier";
          let unitCost = item.unitCost || 0;

          if (item.item === "Science Lab Kit - Grade 10") {
            supplier = "EduLab Supplies";
            unitCost = item.unitCost || 850;
          } else if (item.item === "Student Laptop - Standard") {
            supplier = "TechEdu Solutions";
            unitCost = item.unitCost || 42000;
          } else if (
            item.item === "Mathematics Textbook - Grade 8"
          ) {
            supplier = "Academic Publishers";
            unitCost = item.unitCost || 420;
          } else if (item.item === "School Uniform - Medium") {
            supplier = "SchoolWear India";
            unitCost = item.unitCost || 750;
          }

          if (quantity <= 0) {
            return null;
          }

          let explanation =
            "Purchase quantity is recommended based on forecast demand, safety stock and available inventory.";

          if (priority === "Critical") {
            explanation =
              "Current available inventory is below the required level and the item requires immediate purchase review.";
          } else if (priority === "High") {
            explanation =
              "The inventory gap and longer supplier lead time indicate that a purchase should be planned during the current cycle.";
          }

          return {
            item: item.item,
            category: item.category,
            supplier,
            quantity,
            unitCost,
            totalCost: quantity * unitCost,
            priority,
            status,

            confidence,
            recommendedAction,
            explanation,

            sourceData: {
              currentStock,
              safetyStock,
              forecastDemand,
              leadTime,
              openOrders,
              reservedQuantity,
            },

            modelVersion,
            generatedAt,
          };
        })
        .filter(Boolean);

      if (recommendations.length > 0) {
        await PurchaseRecommendation.insertMany(recommendations);
      }

      purchaseData = await PurchaseRecommendation.find().sort({
        createdAt: 1,
      });
    }

    /* =========================
       KPIs
    ========================= */

    const pendingApproval = purchaseData.filter(
      (item) => item.status === "Pending Review"
    ).length;

    const recommendedUnits = purchaseData.reduce(
      (total, item) => total + item.quantity,
      0
    );

    const estimatedSpend = purchaseData.reduce(
      (total, item) => total + item.totalCost,
      0
    );

    const purchaseRecommendations = purchaseData.filter(
      (item) =>
        item.status === "Recommended" ||
        item.status === "Pending Review"
    ).length;

    const kpis = {
      purchaseRecommendations,
      pendingApproval,
      recommendedUnits,
      estimatedSpend,
    };

    /* =========================
       PLANNING SUMMARY
    ========================= */

    const summary = {
      criticalPurchases: purchaseData.filter(
        (item) => item.priority === "Critical"
      ).length,

      highPriority: purchaseData.filter(
        (item) => item.priority === "High"
      ).length,

      approved: purchaseData.filter(
        (item) => item.status === "Approved"
      ).length,

      planningCycle: 30,
    };

    res.status(200).json({
      message: "Purchase planning data fetched successfully.",
      data: {
        kpis,
        purchaseData,
        summary,
      },
    });
  } catch (error) {
    console.error("Purchase planning error:", error);

    res.status(500).json({
      message: "Unable to fetch purchase planning data.",
    });
  }
};

/* =========================
   APPROVE
========================= */

const approvePurchaseRecommendation = async (req, res) => {
  try {
    const { id } = req.params;

    const recommendation =
      await PurchaseRecommendation.findById(id);

    if (!recommendation) {
      return res.status(404).json({
        message: "Purchase recommendation not found.",
      });
    }

    if (
      recommendation.status !== "Recommended" &&
      recommendation.status !== "Pending Review"
    ) {
      return res.status(400).json({
        message: "This recommendation cannot be approved.",
      });
    }

    recommendation.status = "Approved";

    recommendation.reviewedBy =
      req.user?.name || req.user?.email || "Unknown User";

    recommendation.reviewedAt = new Date();

    recommendation.rejectionReason = "";

    await recommendation.save();

    await AuditLog.create({
      user:
        req.user?.name ||
        req.user?.email ||
        "Unknown User",
      role: req.user?.role || "Unknown Role",
      action: "Approval",
      resource: `Purchase Recommendation - ${recommendation.item}`,
      status: "Success",
      timestamp: new Date(),
    });

    res.status(200).json({
      message: "Purchase recommendation approved successfully.",
      data: recommendation,
    });
  } catch (error) {
    console.error(
      "Approve purchase recommendation error:",
      error
    );

    res.status(500).json({
      message: "Unable to approve purchase recommendation.",
    });
  }
};

/* =========================
   REJECT
========================= */

const rejectPurchaseRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Rejection reason is required.",
      });
    }

    const recommendation =
      await PurchaseRecommendation.findById(id);

    if (!recommendation) {
      return res.status(404).json({
        message: "Purchase recommendation not found.",
      });
    }

    if (
      recommendation.status !== "Recommended" &&
      recommendation.status !== "Pending Review"
    ) {
      return res.status(400).json({
        message: "This recommendation cannot be rejected.",
      });
    }

    recommendation.status = "Rejected";

    recommendation.rejectionReason = reason.trim();

    recommendation.reviewedBy =
      req.user?.name || req.user?.email || "Unknown User";

    recommendation.reviewedAt = new Date();

    await recommendation.save();

    await AuditLog.create({
      user:
        req.user?.name ||
        req.user?.email ||
        "Unknown User",
      role: req.user?.role || "Unknown Role",
      action: "Rejection",
      resource: `Purchase Recommendation - ${recommendation.item}`,
      status: "Success",
      timestamp: new Date(),
    });

    res.status(200).json({
      message: "Purchase recommendation rejected successfully.",
      data: recommendation,
    });
  } catch (error) {
    console.error(
      "Reject purchase recommendation error:",
      error
    );

    res.status(500).json({
      message: "Unable to reject purchase recommendation.",
    });
  }
};

/* =========================
   DEFER
========================= */

const deferPurchaseRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Defer reason is required.",
      });
    }

    const recommendation =
      await PurchaseRecommendation.findById(id);

    if (!recommendation) {
      return res.status(404).json({
        message: "Purchase recommendation not found.",
      });
    }

    if (
      recommendation.status !== "Recommended" &&
      recommendation.status !== "Pending Review"
    ) {
      return res.status(400).json({
        message: "This recommendation cannot be deferred.",
      });
    }

    recommendation.status = "Deferred";

    recommendation.deferReason = reason.trim();

    recommendation.reviewedBy =
      req.user?.name || req.user?.email || "Unknown User";

    recommendation.reviewedAt = new Date();

    await recommendation.save();

    await AuditLog.create({
      user:
        req.user?.name ||
        req.user?.email ||
        "Unknown User",
      role: req.user?.role || "Unknown Role",
      action: "Defer",
      resource: `Purchase Recommendation - ${recommendation.item}`,
      status: "Success",
      timestamp: new Date(),
    });

    res.status(200).json({
      message: "Purchase recommendation deferred successfully.",
      data: recommendation,
    });
  } catch (error) {
    console.error(
      "Defer purchase recommendation error:",
      error
    );

    res.status(500).json({
      message: "Unable to defer purchase recommendation.",
    });
  }
};

/* =========================
   OVERRIDE
========================= */

const overridePurchaseRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason } = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        message: "Override quantity is required.",
      });
    }

    if (Number(quantity) < 0) {
      return res.status(400).json({
        message: "Override quantity cannot be negative.",
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Override reason is required.",
      });
    }

    const recommendation =
      await PurchaseRecommendation.findById(id);

    if (!recommendation) {
      return res.status(404).json({
        message: "Purchase recommendation not found.",
      });
    }

    if (
      recommendation.status !== "Recommended" &&
      recommendation.status !== "Pending Review" &&
      recommendation.status !== "Approved" &&
      recommendation.status !== "Rejected"
    ) {
      return res.status(400).json({
        message: "This recommendation cannot be overridden.",
      });
    }

    if (recommendation.originalQuantity === null) {
      recommendation.originalQuantity = recommendation.quantity;
    }

    recommendation.quantity = Number(quantity);

    recommendation.totalCost =
      recommendation.quantity * recommendation.unitCost;

    recommendation.status = "Overridden";

    recommendation.overrideReason = reason.trim();

    recommendation.reviewedBy =
      req.user?.name || req.user?.email || "Unknown User";

    recommendation.reviewedAt = new Date();

    await recommendation.save();

    await AuditLog.create({
      user:
        req.user?.name ||
        req.user?.email ||
        "Unknown User",
      role: req.user?.role || "Unknown Role",
      action: "Override",
      resource: `Purchase Recommendation - ${recommendation.item}`,
      status: "Success",
      timestamp: new Date(),
    });

    res.status(200).json({
      message: "Purchase recommendation overridden successfully.",
      data: recommendation,
    });
  } catch (error) {
    console.error(
      "Override purchase recommendation error:",
      error
    );

    res.status(500).json({
      message: "Unable to override purchase recommendation.",
    });
  }
};

module.exports = {
  getPurchasePlanning,
  approvePurchaseRecommendation,
  rejectPurchaseRecommendation,
  deferPurchaseRecommendation,
  overridePurchaseRecommendation,
};