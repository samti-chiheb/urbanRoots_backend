const express = require("express");
const router = express.Router();
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
} = require("../controllers/authController");

// Route public
router.post("/register", register);
router.post("/login", login);
router.get("/access-token", getAccessToken);

// Middleware de vérification JWT pour toutes les routes suivantes
router.use(verifyJWT);

// Routes protégées
router.post("/logout", logout);
router.put("/update-info", updateUserInfo);
router.put("/update-username", updateUsername);
router.put("/update-email", updateEmail);
router.put("/update-password", updatePassword);
router.delete("/delete-user", deleteUser);

module.exports = router;
