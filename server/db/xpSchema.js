// models/Experience.js
const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      required: [true, "Position title is required"],
      trim: true,
    },
    organization: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value >= this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    skillsGained: [String],
  },
  { timestamps: true }
);

// Index for sorting by most recent role
experienceSchema.index({ startDate: -1 });

module.exports = mongoose.model("Experience", experienceSchema);