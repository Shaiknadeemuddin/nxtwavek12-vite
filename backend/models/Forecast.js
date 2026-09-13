const mongoose = require("mongoose");

const forecastSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    forecastDemand: {
      type: Number,
      required: true,
      min: 0,
    },

    confidence: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    risk: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    horizon: {
      type: Number,
      default: 30,
      min: 1,
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
    },

    modelVersion: {
      type: String,
      default: "v1.0",
      trim: true,
    },

    forecastDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Forecast", forecastSchema);