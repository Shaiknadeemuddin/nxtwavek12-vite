const Inventory = require("../models/Inventory");
const AuditLog = require("../models/AuditLog");

const getReplenishment = async (req, res) => {
  try {
    const inventoryData = await Inventory.find();

    const modelVersion = "Replenishment-Recommendation-v1.0";
    const generatedAt = new Date();

    const replenishmentData = inventoryData.map((item, index) => {
      const stockDifference = item.safetyStock - item.stock;

      let priority = "Low";
      let status = "No Action";
      let recommendedQty = 0;
      let confidence = "Medium";
      let recommendedAction = "Monitor inventory";
      let explanation =
        "Current stock is above the required safety stock level.";

      if (item.stock < item.safetyStock) {
        recommendedQty = stockDifference;

        if (item.status === "Critical") {
          priority = "Critical";
          status = "Pending Review";
          confidence = "High";
          recommendedAction = "Replenish immediately";
          explanation =
            "Current stock is below safety stock and the item is marked as critical. Immediate replenishment is recommended.";
        } else {
          priority = "Normal";
          status = "Recommended";
          confidence = "High";
          recommendedAction = "Replenish stock";
          explanation =
            "Current stock is below safety stock. Replenishment is recommended to restore the required inventory level.";
        }
      } else if (item.stock === item.safetyStock) {
        confidence = "High";
        recommendedAction = "Monitor inventory";
        explanation =
          "Current stock is at the safety stock level. No immediate replenishment is required.";
      }

      const estimatedUnitCost =
        item.unitCost && item.unitCost > 0 ? item.unitCost : 0;

      const estimatedCost = recommendedQty * estimatedUnitCost;

      return {
        id: index + 1,
        item: item.item,
        category: item.category,
        location: item.location,
        currentStock: item.stock,
        safetyStock: item.safetyStock,
        recommendedQty,
        priority,
        status,

        confidence,
        recommendedAction,
        explanation,

        sourceData: {
          currentStock: item.stock,
          safetyStock: item.safetyStock,
          leadTime: item.leadTime,
          openOrders: item.openOrders,
          reservedQuantity: item.reservedQuantity,
          forecastDemand: item.forecastDemand,
        },

        estimatedUnitCost,
        estimatedCost,
        modelVersion,
        generatedAt,
      };
    });

    const recommendations = replenishmentData.filter(
      (item) =>
        item.status === "Pending Review" ||
        item.status === "Recommended"
    ).length;

    const criticalItems = replenishmentData.filter(
      (item) => item.priority === "Critical"
    ).length;

    const recommendedUnits = replenishmentData.reduce(
      (total, item) => total + item.recommendedQty,
      0
    );

    const totalEstimatedCost = replenishmentData.reduce(
      (total, item) => total + item.estimatedCost,
      0
    );

    const estimatedCost = totalEstimatedCost / 100000;

    const kpis = {
      recommendations,
      criticalItems,
      recommendedUnits,
      estimatedCost: Number(estimatedCost.toFixed(2)),
    };

    /* =========================
       AI EXECUTION AUDIT
    ========================= */

    await AuditLog.create({
      user: "System",
      role: "System",
      action: "AI Execution",
      resource: `Replenishment Recommendations - ${modelVersion}`,
      status: "Success",
      timestamp: generatedAt,
    });

    res.status(200).json({
      message: "Replenishment data fetched successfully.",
      data: {
        kpis,
        replenishmentData,
        model: {
          version: modelVersion,
          generatedAt,
          type: "AI-assisted replenishment recommendation",
        },
      },
    });
  } catch (error) {
    console.error("Replenishment error:", error);

    res.status(500).json({
      message: "Unable to fetch replenishment data.",
    });
  }
};

module.exports = {
  getReplenishment,
};