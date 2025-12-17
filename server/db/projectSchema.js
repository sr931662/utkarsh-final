// models/Project.js
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
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
    status: {
      type: String,
      enum: ["ongoing", "completed", "paused"],
      default: "ongoing",
    },
    fundingAgency: {
      type: String,
      trim: true,
    },
    collaborators: {
      type: [String],
      validate: {
        validator: (collabs) => collabs.length <= 20,
        message: "Maximum 20 collaborators allowed",
      },
    },
    projectLink: {
      type: String,
      validate: [validator.isURL, "Invalid URL"],
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
    technologies: [String],
  },
  { timestamps: true }
);

// Indexes
projectSchema.index({ title: "text", status: 1 });

module.exports = mongoose.model("Project", projectSchema);