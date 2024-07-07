const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT.js");
const verifyRoles = require("../middleware/verifyRoles.js");
const ROLES_LIST = require("../config/rolesList.js");
const {
  createPost,
  getPostsByForum,
  getOnePost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
} = require("../controllers/forumPostController.js");
const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  upvoteComment,
  downvoteComment,
} = require("../controllers/forumCommentController.js");

// Route public
router.get("/:forumId/posts", getPostsByForum);
router.get("/:postId", getOnePost);
router.get("/:postId/comments", getCommentsByPost);

// Middleware de vérification JWT pour toutes les routes suivantes
router.use(verifyJWT);

// user routes
router.post("/create", createPost);
router.put("/:postId", verifyRoles(ROLES_LIST.admin), updatePost);
router.delete("/:postId", deletePost);

router.post("/:postId/comments", createComment);
router.put(
  "/comments/:commentId",
  verifyRoles(ROLES_LIST.admin),
  updateComment
);
router.delete("/comments/:commentId", deleteComment);

router.put("/:postId/like", likePost);
router.put("/:postId/unlike", unlikePost);

router.put("/comments/:commentId/upvote", upvoteComment);
router.put("/comments/:commentId/downvote", downvoteComment);

module.exports = router;
