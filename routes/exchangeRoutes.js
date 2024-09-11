const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT.js");

const {
  createExchange,
  getExchanges,
  getExchangeById,
  updateExchange,
  deleteExchange,
} = require("../controllers/exchangeController");


// Routes publiques
router.get("/", getExchanges);
router.get("/:exchangeId", getExchangeById);

// Routes protégées
router.post("/", verifyJWT, createExchange);
router.put("/:exchangeId", verifyJWT, updateExchange);
router.delete("/:exchangeId", verifyJWT, deleteExchange);

module.exports = router;
