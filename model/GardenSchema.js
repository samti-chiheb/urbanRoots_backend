const mongoose = require("mongoose");
const User = require("./User"); // Import du modèle User

const GardenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
    description: {
      type: String,
      required: false,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

GardenSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model("Garden", GardenSchema);