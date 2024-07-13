const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/rolesList.js");
const {
  getForums,
  getForumById,
  createForum,
  updateForum,
  deleteForum,
} = require("../controllers/forumController.js");

// Public routes
router.get("/", getForums);
router.get("/:forumId", getForumById);

// Middleware pour protéger les routes et vérifier les rôles
router.use(verifyJWT);

router.post("/", verifyRoles(ROLES_LIST.admin), createForum);
router.put("/:forumId", verifyRoles(ROLES_LIST.admin), updateForum);
router.delete("/:forumId", verifyRoles(ROLES_LIST.admin), deleteForum);

module.exports = router;
