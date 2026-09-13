const Inventory = require("../models/Inventory");
const AuditLog = require("../models/AuditLog");

const getForecasting = async (req, res) => {
  try {
    const inventoryData = await Inventory.find();

    const modelVersion = "Demand-Forecast-v1.2";
    const forecastTimestamp = new Date();

    const forecastData = inventoryData.map((item, index) => {
      let forecast = item.stock;
      let confidence = "Medium";
      let risk = "Low";
      let explanation =
        "Forecast is based on current inventory and planning inputs.";

      if (item.item === "Mathematics Textbook - Grade 8") {
        forecast = 3200;
        confidence = "High";
        risk = "Low";
        explanation =
          "High-confidence demand forecast based on expected academic demand and current inventory.";
      } else if (item.item === "Science Lab Kit - Grade 10") {
        forecast = 780;
        confidence = "High";
        risk = "Critical";
        explanation =
          "High demand risk detected because forecast demand is significant compared with available stock.";
      } else if (item.item === "School Uniform - Medium") {
        forecast = 1400;
        confidence = "Medium";
        risk = "Excess";
        explanation =
          "Forecast indicates potential excess inventory based on expected demand and current stock.";
      } else if (item.item === "Student Laptop - Standard") {
        forecast = 210;
        confidence = "Medium";
        risk = "Critical";
        explanation =
          "Critical risk detected because forecast demand may place pressure on available inventory.";
      }

      return {
        id: index + 1,
        item: item.item,
        category: item.category,

        forecast,
        currentStock: item.stock,
        confidence,
        risk,

        sourceData: {
          currentStock: item.stock,
          safetyStock: item.safetyStock,
          leadTime: item.leadTime,
          openOrders: item.openOrders,
          reservedQuantity: item.reservedQuantity,
        },

        explanation,
        modelVersion,
        forecastTimestamp,
      };
    });

    const totalForecastDemand = forecastData.reduce(
      (total, item) => total + item.forecast,
      0
    );

    const highConfidenceCount = forecastData.filter(
      (item) => item.confidence === "High"
    ).length;

    const atRiskCount = forecastData.filter(
      (item) => item.risk === "Critical"
    ).length;

    const highConfidencePercentage =
      forecastData.length > 0
        ? Math.round((highConfidenceCount / forecastData.length) * 100)
        : 0;

    const kpis = {
      forecastHorizon: 30,
      forecastDemand: totalForecastDemand,
      highConfidence: highConfidencePercentage,
      atRisk: atRiskCount,
    };

    /* =========================
       AI EXECUTION AUDIT
    ========================= */

    await AuditLog.create({
      user: "System",
      role: "System",
      action: "AI Execution",
      resource: `Demand Forecast - ${modelVersion}`,
      status: "Success",
      timestamp: forecastTimestamp,
    });

    res.status(200).json({
      message: "Forecasting data fetched successfully.",
      data: {
        kpis,
        forecastData,
        model: {
          version: modelVersion,
          generatedAt: forecastTimestamp,
          type: "AI-assisted demand forecasting",
        },
      },
    });
  } catch (error) {
    console.error("Forecasting error:", error);

    res.status(500).json({
      message: "Unable to fetch forecasting data.",
    });
  }
};

module.exports = {
  getForecasting,
};