const mongoose = require("mongoose");

const forumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

const Forum = mongoose.model("Forum", forumSchema);
module.exports = Forum;
