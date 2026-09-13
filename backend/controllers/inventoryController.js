const Inventory = require("../models/Inventory");

const getInventory = async (req, res) => {
  try {
    const inventoryData = await Inventory.find().sort({ createdAt: 1 });

    const totalItems = inventoryData.length;

    const totalStock = inventoryData.reduce(
      (total, item) => total + item.stock,
      0
    );

    const lowStock = inventoryData.filter(
      (item) => item.stock < item.safetyStock
    ).length;

    const kpis = {
      totalItems,
      totalStock,
      lowStock,
      expiringSoon: 0,
    };

    res.status(200).json({
      message: "Inventory data fetched successfully.",
      data: {
        kpis,
        inventoryData,
      },
    });
  } catch (error) {
    console.error("Inventory error:", error);

    res.status(500).json({
      message: "Unable to fetch inventory data.",
    });
  }
};

const getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const inventoryItem = await Inventory.findById(id);

    if (!inventoryItem) {
      return res.status(404).json({
        message: "Inventory item not found.",
      });
    }

    res.status(200).json({
      message: "Inventory item fetched successfully.",
      data: inventoryItem,
    });
  } catch (error) {
    console.error("Inventory item error:", error);

    res.status(500).json({
      message: "Unable to fetch inventory item.",
    });
  }
};

module.exports = {
  getInventory,
  getInventoryItem,
};