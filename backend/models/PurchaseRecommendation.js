const mongoose = require("mongoose");

const purchaseRecommendationSchema = new mongoose.Schema(
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

    supplier: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },

    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    status: {
      type: String,
      enum: [
        "Recommended",
        "Pending Review",
        "Approved",
        "Rejected",
        "Overridden",
        "Deferred",
      ],
      default: "Recommended",
    },

    /* =========================
       AI RECOMMENDATION DETAILS
    ========================= */

    confidence: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    recommendedAction: {
      type: String,
      default: "Review purchase recommendation",
      trim: true,
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
    },

    sourceData: {
      currentStock: {
        type: Number,
        default: 0,
      },

      safetyStock: {
        type: Number,
        default: 0,
      },

      forecastDemand: {
        type: Number,
        default: 0,
      },

      leadTime: {
        type: Number,
        default: 0,
      },

      openOrders: {
        type: Number,
        default: 0,
      },

      reservedQuantity: {
        type: Number,
        default: 0,
      },
    },

    modelVersion: {
      type: String,
      default: "Purchase-Recommendation-v1.0",
      trim: true,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },

    /* =========================
       HUMAN REVIEW
    ========================= */

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    deferReason: {
      type: String,
      default: "",
      trim: true,
    },

    overrideReason: {
      type: String,
      default: "",
      trim: true,
    },

    originalQuantity: {
      type: Number,
      default: null,
      min: 0,
    },

    reviewedBy: {
      type: String,
      default: "",
      trim: true,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PurchaseRecommendation",
  purchaseRecommendationSchema
);