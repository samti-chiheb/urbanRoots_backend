const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExchangeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["actif", "completé", "réservé", "annulé"],
      default: "actif",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Exchange", ExchangeSchema);
