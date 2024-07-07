const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT.js");
const verifyRoles = require("../middleware/verifyRoles.js");
const ROLES_LIST = require("../config/rolesList.js");
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/forumController.js");

// Route public
router.get("/all", getAllCategories);

// Middleware de vérification JWT pour toutes les routes suivantes
router.use(verifyJWT);

// admin routes

router.post("/", verifyRoles(ROLES_LIST.admin), createCategory);
router.put(
  "/:categoryId",
  verifyRoles(ROLES_LIST.admin),
  updateCategory
);
router.delete(
  "/:categoryId",
  verifyRoles(ROLES_LIST.admin),
  deleteCategory
);

module.exports = router;
