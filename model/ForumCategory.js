const mongoose = require("mongoose");

const forumCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const ForumCategory = mongoose.model("Forum_Category", forumCategorySchema);
module.exports = ForumCategory;
