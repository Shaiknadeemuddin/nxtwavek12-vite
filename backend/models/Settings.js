const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    defaultLocation: {
      type: String,
      required: true,
      trim: true,
    },

    planningHorizon: {
      type: String,
      required: true,
    },

    serviceLevel: {
      type: String,
      required: true,
    },

    notifications: {
      type: Boolean,
      default: true,
    },

    emailAlerts: {
      type: Boolean,
      default: true,
    },

    aiRecommendations: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);