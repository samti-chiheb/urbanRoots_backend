const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT.js");
const verifyRoles = require("../middleware/verifyRoles.js");
const ROLES_LIST = require("../config/rolesList.js");
const {
  getForums,
  getForumById,
  getForumByCategory,
  createForum,
  updateForum,
  deleteForum,
} = require("../controllers/forumController.js");

// Public routes
router.get("/", getForums);
router.get("/:forumId", getForumById);
router.get("/category/:categoryId", getForumByCategory);

// Middleware pour protéger les routes et vérifier les rôles
router.use(verifyJWT);

router.post("/", verifyRoles(ROLES_LIST.admin), createForum);
router.put("/:forumId", verifyRoles(ROLES_LIST.admin), updateForum);
router.delete("/:forumId", verifyRoles(ROLES_LIST.admin), deleteForum);

module.exports = router;
