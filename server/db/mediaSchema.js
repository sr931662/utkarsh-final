// models/Media.js
const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["image", "pdf", "document", "presentation"],
      required: true,
    },
    description: {
      type: String,
      maxlength: 200,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    associatedModel: {
      type: String,
      enum: ["Publication", "Project", "Award", "Education", "Experience"],
    },
    associatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

// Index for faster lookups
mediaSchema.index({ associatedModel: 1, associatedId: 1 });

module.exports = mongoose.model("Media", mediaSchema);