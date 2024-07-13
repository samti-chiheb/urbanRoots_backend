const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT.js");
const ROLES_LIST = require("../config/rolesList.js");
const {
  createPost,
  getPosts,
  getPostsByForum,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  dislikePost,
} = require("../controllers/forumPostController.js");

// Récupérer tous les posts d'un forum
router.get("/:forumId/posts", getPostsByForum);
router.get("/", getPosts);
router.get("/:postId", getPostById);

// Middleware pour protéger les routes et vérifier les rôles
router.use(verifyJWT);

router.post("/", createPost);
router.put("/:postId", updatePost);
router.delete("/:postId", deletePost);

// Post Like
router.patch("/:postId/like", likePost);
router.patch("/:postId/dislike", dislikePost);

module.exports = router;