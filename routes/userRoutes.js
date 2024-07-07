const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/rolesList.js");

const {
  register,
  login,
  updateUserInfo,
  updateUsername,
  updateEmail,
  updatePassword,
  logout,
  getAccessToken,
  deleteUser,
} = require("../controllers/authController.js");
const { getAllUsers } = require("../controllers/userController.js");

// Route public
router.post("/register", register);
router.post("/login", login);
router.get("/refresh", getAccessToken);
router.post("/logout", logout);

// Middleware de vérification JWT pour toutes les routes suivantes
router.use(verifyJWT);

// Routes protégées
router.put("/update-info", updateUserInfo);
router.put("/update-username", updateUsername);
router.put("/update-email", updateEmail);
router.put("/update-password", updatePassword);
router.delete("/delete", deleteUser);

// Admin routes
router.get("/all", verifyRoles(ROLES_LIST.admin), getAllUsers);

module.exports = router;
