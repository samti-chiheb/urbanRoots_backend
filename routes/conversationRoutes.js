const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT.js");
const {
  createConversation,
  getConversations,
  getConversationById,
  sendMessage,
  deleteConversation,
} = require("../controllers/conversationController.js");

// Route pour créer une nouvelle conversation
router.post("/", verifyJWT, createConversation);

// Route pour récupérer toutes les conversations de l'utilisateur connecté
router.get("/", verifyJWT, getConversations);

// Route pour récupérer une conversation spécifique par ID
router.get("/:conversationId", verifyJWT, getConversationById);

// Route pour envoyer un message dans une conversation
router.post("/:conversationId/messages", verifyJWT, sendMessage);
// Route pour supprimer une conversation spécifique
router.delete("/:conversationId", verifyJWT, deleteConversation);

module.exports = router;
