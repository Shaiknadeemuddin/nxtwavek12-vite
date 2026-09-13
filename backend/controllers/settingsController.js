const Settings = require("../models/Settings");

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        companyName: "K-12 Education Group",
        defaultLocation: "Hyderabad",
        planningHorizon: "30 Days",
        serviceLevel: "95%",
        notifications: true,
        emailAlerts: true,
        aiRecommendations: true,
      });
    }

    res.status(200).json({
      message: "Settings fetched successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("Settings fetch error:", error);

    res.status(500).json({
      message: "Unable to fetch settings.",
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const {
      companyName,
      defaultLocation,
      planningHorizon,
      serviceLevel,
      notifications,
      emailAlerts,
      aiRecommendations,
    } = req.body;

    if (
      !companyName ||
      !defaultLocation ||
      !planningHorizon ||
      !serviceLevel
    ) {
      return res.status(400).json({
        message: "Required settings fields are missing.",
      });
    }

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        companyName: companyName.trim(),
        defaultLocation,
        planningHorizon,
        serviceLevel,
        notifications,
        emailAlerts,
        aiRecommendations,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Settings saved successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("Settings update error:", error);

    res.status(500).json({
      message: "Unable to save settings.",
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};