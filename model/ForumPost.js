const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    forum: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Forum",
      required: true,
    },
    tags: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const ForumPost = mongoose.model("Forum_Post", forumPostSchema);
module.exports = ForumPost;