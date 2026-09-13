const Inventory = require("../models/Inventory");

const getReports = async (req, res) => {
  try {
    const inventoryData = await Inventory.find();

    const lowStockItems = inventoryData.filter(
      (item) => item.stock < item.safetyStock
    ).length;

    const criticalItems = inventoryData.filter(
      (item) => item.status === "Critical"
    ).length;

    const totalStock = inventoryData.reduce(
      (total, item) => total + item.stock,
      0
    );

    const reports = [
      {
        id: 1,
        name: "Inventory Status Report",
        type: "Inventory",
        description:
          "Current stock levels, ageing and inventory health.",
        generated: "Today, 10:30 AM",
        status: "Ready",
      },
      {
        id: 2,
        name: "Demand Forecast Report",
        type: "Forecast",
        description:
          "Forecast demand, confidence and inventory risk.",
        generated: "Today, 09:30 AM",
        status: "Ready",
      },
      {
        id: 3,
        name: "Stockout & Excess Report",
        type: "Inventory",
        description:
          "Items at risk of stockout or excess inventory.",
        generated: "Today, 09:00 AM",
        status: "Ready",
      },
      {
        id: 4,
        name: "Purchase Planning Report",
        type: "Procurement",
        description:
          "Purchase recommendations and estimated spending.",
        generated: "Yesterday, 05:30 PM",
        status: "Ready",
      },
      {
        id: 5,
        name: "Forecast Accuracy Report",
        type: "Analytics",
        description:
          "Actual demand compared with forecasted demand.",
        generated: "Yesterday, 04:15 PM",
        status: "Ready",
      },
      {
        id: 6,
        name: "Supplier Performance Report",
        type: "Procurement",
        description:
          "Supplier delivery, cost and performance analysis.",
        generated: "Yesterday, 03:20 PM",
        status: "Ready",
      },
    ];

    const kpis = {
      totalReports: reports.length,
      inventoryReports: reports.filter(
        (report) => report.type === "Inventory"
      ).length,
      procurementReports: reports.filter(
        (report) => report.type === "Procurement"
      ).length,
      lastGenerated: "Today",
      lastGeneratedTime: "10:30 AM",
    };

    const reportData = {
      inventorySummary: {
        totalItems: inventoryData.length,
        totalStock,
        lowStockItems,
        criticalItems,
      },
      reports,
    };

    res.status(200).json({
      message: "Reports data fetched successfully.",
      data: {
        kpis,
        reportData,
      },
    });
  } catch (error) {
    console.error("Reports error:", error);

    res.status(500).json({
      message: "Unable to fetch reports data.",
    });
  }
};

module.exports = {
  getReports,
};