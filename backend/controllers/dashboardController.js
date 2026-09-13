const Inventory = require("../models/Inventory");

const getDashboard = async (req, res) => {
  try {
    const inventoryData = await Inventory.find();

    const totalInventory = inventoryData.reduce(
      (total, item) => total + item.stock,
      0
    );

    const lowStockItems = inventoryData.filter(
      (item) => item.stock < item.safetyStock
    ).length;

    const stockoutRisk = inventoryData.filter(
      (item) => item.status === "Critical"
    ).length;

    const excessInventory = inventoryData.filter(
      (item) => item.status === "Excess"
    ).length;

    const dashboardData = {
      kpis: {
        totalInventory,
        forecastDemand: 18420,
        lowStockItems,
        stockoutRisk,
        excessInventory,
        openOrders: 47,
      },

      demandData: [
        { month: "Jan", actual: 1200, forecast: 1300 },
        { month: "Feb", actual: 1500, forecast: 1450 },
        { month: "Mar", actual: 1350, forecast: 1400 },
        { month: "Apr", actual: 1800, forecast: 1750 },
        { month: "May", actual: 2100, forecast: 2200 },
        { month: "Jun", actual: 1950, forecast: 2050 },
      ],

      inventoryData: [
        {
          name: "Normal",
          value: inventoryData.filter(
            (item) => item.status === "Normal"
          ).length,
        },
        {
          name: "Low Stock",
          value: inventoryData.filter(
            (item) => item.status === "Warning"
          ).length,
        },
        {
          name: "Critical",
          value: inventoryData.filter(
            (item) => item.status === "Critical"
          ).length,
        },
        {
          name: "Excess",
          value: inventoryData.filter(
            (item) => item.status === "Excess"
          ).length,
        },
      ],

      alerts: [
        {
          id: 1,
          type: "Stockout Risk",
          message:
            "Student Laptop - Standard requires immediate attention",
        },
        {
          id: 2,
          type: "Low Stock",
          message:
            "Science Lab Kit - Grade 10 is below safety stock",
        },
        {
          id: 3,
          type: "Inventory",
          message:
            "Inventory data is being monitored from MongoDB",
        },
      ],
    };

    res.status(200).json({
      message: "Dashboard data fetched successfully.",
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Unable to fetch dashboard data.",
    });
  }
};

module.exports = {
  getDashboard,
};