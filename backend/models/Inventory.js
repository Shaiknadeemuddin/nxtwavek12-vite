const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
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

    location: {
      type: String,
      required: true,
      trim: true,
    },

    lotBatch: {
      type: String,
      default: "N/A",
      trim: true,
    },

    age: {
      type: Number,
      default: 0,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    safetyStock: {
      type: Number,
      required: true,
      default: 0,
    },

    leadTime: {
      type: Number,
      default: 7,
    },

    openOrders: {
      type: Number,
      default: 0,
    },

    reservedQuantity: {
      type: Number,
      default: 0,
    },

    forecastDemand: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Normal", "Warning", "Critical", "Excess"],
      default: "Normal",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);