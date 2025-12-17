// models/Education.js
const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      required: [true, "Degree name is required"],
      trim: true,
    },
    institution: {
      type: String,
      required: [true, "Institution name is required"],
      trim: true,
    },
    fieldOfStudy: {
      type: String,
      trim: true,
    },
    startYear: {
      type: Number,
      required: true,
      min: [1900, "Invalid year"],
    },
    endYear: {
      type: Number,
      validate: {
        validator: function (value) {
          return value >= this.startYear;
        },
        message: "End year must be after start year",
      },
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Sort by most recent education first
educationSchema.index({ startYear: -1 });

module.exports = mongoose.model("Education", educationSchema);