const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT.js");
const verifyRoles = require("../middleware/verifyRoles.js");
const ROLES_LIST = require("../config/rolesList.js");
const {
  createGarden,
  getGardens,
  getGardenById,
  updateGarden,
  deleteGarden,
} = require("../controllers/gardenController.js");

// Public routes
router.get("/", getGardens);
router.get("/:gardenId", getGardenById);

// Middleware pour protéger les routes et vérifier les rôles
router.use(verifyJWT);
router.post("/", createGarden);
router.put("/:gardenId", updateGarden);
router.delete("/:gardenId", deleteGarden);

module.exports = router;
