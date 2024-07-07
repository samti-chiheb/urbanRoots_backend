const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/rolesList.js");
const {
  createForum,
  getAllForums,
  getForumById,
  updateForum,

  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/forumController.js");

// Route public
router.get("/all", getAllForums);
router.get("/:forumId", getForumById);

// Middleware de vérification JWT pour toutes les routes suivantes
router.use(verifyJWT);

// admin routes
router.post("/create", verifyRoles(ROLES_LIST.gardner), createForum);
router.put("/:forumId", verifyRoles(ROLES_LIST.gardner), updateForum);

router.post("/category", verifyRoles(ROLES_LIST.admin), createCategory);
router.get("/category", getAllCategories);
router.put(
  "/category/:categoryId",
  verifyRoles(ROLES_LIST.admin),
  updateCategory
);
router.delete(
  "/category/:categoryId",
  verifyRoles(ROLES_LIST.admin),
  deleteCategory
);

module.exports = router;
