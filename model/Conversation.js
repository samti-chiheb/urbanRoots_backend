const mongoose = require("mongoose");
const { Schema } = mongoose;

// Schéma pour un message individuel dans la conversation
const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Référence à l'utilisateur qui envoie le message
  text: { type: String, required: true }, // Contenu du message
  timestamp: { type: Date, default: Date.now }, // Timestamp du message
  read: { type: Boolean, default: false }, // Ajout d'un statut de lecture pour chaque message
});

// Schéma pour la conversation
const conversationSchema = new Schema({
  initiator: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Utilisateur qui initie la conversation
  participant: { type: Schema.Types.ObjectId, ref: "User", required: true }, // L'autre utilisateur participant à la conversation
  exchange: { type: Schema.Types.ObjectId, ref: "Exchange", required: true }, // Référence à l'objet Exchange
  messages: [messageSchema], // Liste des messages, définis par le schéma messageSchema
  createdAt: { type: Date, default: Date.now }, // Date de création de la conversation
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;