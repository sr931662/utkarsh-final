// models/Award.js
const mongoose = require("mongoose");

const awardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Award title is required"],
      trim: true,
    },
    issuer: {
      type: String,
      required: [true, "Issuing organization is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: [1900, "Invalid year"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      enum: ["academic", "professional", "fellowship", "grant", "other"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Sort by most recent awards
awardSchema.index({ year: -1 });

module.exports = mongoose.model("Award", awardSchema);