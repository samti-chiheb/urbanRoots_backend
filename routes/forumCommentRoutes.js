const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT.js");
const ROLES_LIST = require("../config/rolesList.js");
const {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  upvoteComment,
  downvoteComment,
} = require("../controllers/forumCommentController.js");

router.get("/:postId", getCommentsByPost);

// Les routes de création, mise à jour et suppression nécessitent un JWT
router.use(verifyJWT);

router.post("/post/:postId", createComment);
router.put("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);

//voting routes
router.patch("/:commentId/upvote", upvoteComment);
router.patch("/:commentId/downvote", downvoteComment);

module.exports = router;
