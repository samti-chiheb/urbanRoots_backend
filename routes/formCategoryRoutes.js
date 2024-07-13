const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT.js");
const verifyRoles = require("../middleware/verifyRoles.js");
const ROLES_LIST = require("../config/rolesList.js");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/forumController.js");

// Récupérer toutes les catégories
router.get("/", getAllCategories);
router.get("/:categoryId", getCategoryById);

// Middleware pour protéger les routes et vérifier les rôles
router.use(verifyJWT);

// protected routes
router.post("/", verifyRoles(ROLES_LIST.admin), createCategory);
router.put("/:categoryId", verifyRoles(ROLES_LIST.admin), updateCategory);
router.delete("/:categoryId", verifyRoles(ROLES_LIST.admin), deleteCategory);

module.exports = router;
