const Conversation = require("../model/Conversation");
const User = require("../model/User");
const Exchange = require("../model/Exchange");

/**
 * Crée une nouvelle conversation.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const createConversation = async (req, res) => {
  const { participantId, exchangeId } = req.body;

  // Vérifie que les champs obligatoires sont fournis
  if (!participantId || !exchangeId) {
    return res
      .status(400)
      .json({ message: "Tous les champs obligatoires doivent être remplis !" });
  }

  try {
    // Vérifie que l'utilisateur existe
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifie que l'échange et le participant existent
    const exchange = await Exchange.findById(exchangeId);
    const participant = await User.findById(participantId);

    if (!exchange || !participant) {
      return res
        .status(404)
        .json({ message: "Échange ou participant non trouvé" });
    }

    // Empêche l'utilisateur de créer une conversation avec lui-même
    if (req.userId === participantId) {
      return res.status(400).json({
        message: "Vous ne pouvez pas créer une conversation avec vous-même.",
      });
    }

    // Crée une nouvelle conversation
    const conversation = new Conversation({
      initiator: req.userId,
      participant: participantId,
      exchange: exchangeId,
      messages: [],
    });

    const result = await conversation.save();
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur lors de la création de la conversation",
      error: err.message,
    });
  }
};

/**
 * Récupère toutes les conversations de l'utilisateur.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ initiator: req.userId }, { participant: req.userId }],
    }).populate("initiator participant exchange");

    res.status(200).json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur lors de la récupération des conversations",
      error: err.message,
    });
  }
};

/**
 * Récupère une conversation spécifique par ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getConversationById = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const conversation = await Conversation.findById(conversationId)
      .populate("initiator participant exchange")
      .populate("messages.sender");

    if (!conversation) {
      return res.status(404).json({ message: "Conversation non trouvée" });
    }

    // Vérifie si l'utilisateur fait partie de la conversation
    if (
      conversation.initiator.equals(req.userId) ||
      conversation.participant.equals(req.userId)
    ) {
      res.status(200).json(conversation);
    } else {
      res
        .status(403)
        .json({ message: "Accès non autorisé à cette conversation." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur lors de la récupération de la conversation",
      error: err.message,
    });
  }
};

/**
 * Envoie un message dans une conversation existante.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res
      .status(400)
      .json({ message: "Le texte du message est obligatoire" });
  }

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation non trouvée" });
    }

    // Vérifie si l'utilisateur fait partie de la conversation
    if (
      conversation.initiator.equals(req.userId) ||
      conversation.participant.equals(req.userId)
    ) {
      const newMessage = {
        sender: req.userId,
        text,
        timestamp: Date.now(),
        read: false, // Marque le message comme non lu par défaut
      };

      // Ajoute le message à la conversation
      conversation.messages.push(newMessage);
      await conversation.save();

      res.status(200).json(conversation);
    } else {
      res
        .status(403)
        .json({ message: "Accès non autorisé à cette conversation." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur lors de l'envoi du message",
      error: err.message,
    });
  }
};

/**
 * Supprime une conversation par son ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const deleteConversation = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation non trouvée" });
    }

    // Vérifie si l'utilisateur fait partie de la conversation
    if (
      conversation.initiator.equals(req.userId) ||
      conversation.participant.equals(req.userId)
    ) {
      await conversation.deleteOne();
      res.status(200).json({ message: "Conversation supprimée avec succès." });
    } else {
      res
        .status(403)
        .json({ message: "Accès non autorisé à cette conversation." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur lors de la suppression de la conversation",
      error: err.message,
    });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversationById,
  sendMessage,
  deleteConversation,
};
