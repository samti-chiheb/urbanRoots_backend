const Exchange = require("../model/Exchange");
const User = require("../model/User");

/**
 * Récupère toutes les annonces d'échange.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getExchanges = async (req, res) => {
  try {
    // Récupère toutes les annonces d'échange et les détails de l'utilisateur créateur
    const exchanges = await Exchange.find().populate("createdBy", "-password -refreshToken" );

    // Réponse avec les annonces trouvées
    res.status(200).json(exchanges);
  } catch (error) {
    // En cas d'erreur, renvoie un message avec le statut 500
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des annonces." });
  }
};

/**
 * Valide les données d'une annonce d'échange.
 *
 * @param {Object} exchangeData - Les données de l'annonce d'échange
 * @returns {string|null} - Un message d'erreur ou null si les données sont valides
 */
const validateExchangeData = (exchangeData) => {
  if (!exchangeData.title) return "Le titre est requis.";
  if (!exchangeData.description) return "La description est requise.";
  if (!exchangeData.category) return "La catégorie est requise.";
  if (!exchangeData.location) return "La localisation est requise.";
  if (exchangeData.imageUrl && typeof exchangeData.imageUrl !== "string") {
    return "L'URL de l'image doit être une chaîne de caractères valide.";
  }
  return null;
};

/**
 * Crée une nouvelle annonce d'échange.
 *
 * @param {Object} req - L'objet de la requête contenant les données de l'annonce
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const createExchange = async (req, res) => {
  const { title, description, category, location, imageUrl } = req.body;

  // Validation des données d'échange
  const error = validateExchangeData(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    // Vérification de l'existence de l'utilisateur
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }



    // Création de l'annonce d'échange
    const newExchange = new Exchange({
      title,
      description,
      category,
      location,
      imageUrl,
      createdBy: req.userId,
    });

    // Sauvegarde de l'annonce dans la base de données
    const exchange = await newExchange.save();
    res.status(201).json({ message: "Annonce créée avec succès.", exchange });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'annonce.", error: error });
  }
};

/**
 * Récupère une annonce d'échange par ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getExchangeById = async (req, res) => {
  try {
    // Recherche de l'annonce d'échange par son ID et exclusion du password et du refreshToken de l'utilisateur
    const exchange = await Exchange.findById(req.params.exchangeId).populate(
      "createdBy",
      "-password -refreshToken"
    );

    // Si l'annonce n'est pas trouvée, renvoyer une erreur 404
    if (!exchange) {
      return res.status(404).json({ message: "Annonce non trouvée." });
    }

    // Réponse avec l'annonce trouvée
    res.status(200).json(exchange);
  } catch (error) {
    // En cas d'erreur, renvoie un message avec le statut 500
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'annonce." });
  }
};

/**
 * Met à jour une annonce d'échange.
 *
 * @param {Object} req - L'objet de la requête contenant les données mises à jour
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const updateExchange = async (req, res) => {
  const { title, description, category, location, imageUrl, status } = req.body;

  try {
    // Recherche de l'annonce d'échange par ID
    const exchange = await Exchange.findById(req.params.exchangeId);
    if (!exchange) {
      return res.status(404).json({ message: "Annonce non trouvée." });
    }

    // Vérification que l'utilisateur est bien celui qui a créé l'annonce
    if (exchange.createdBy.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Non autorisé à modifier cette annonce." });
    }

    // Mise à jour des champs si présents dans la requête
    if (title) exchange.title = title;
    if (description) exchange.description = description;
    if (category) exchange.category = category;
    if (location) exchange.location = location;
    if (imageUrl) exchange.imageUrl = imageUrl;

    // Mise à jour du statut si présent dans la requête et validé par les statuts possibles
    if (status && ["actif", "réservé", "completé", "annulé"].includes(status)) {
      exchange.status = status;
    }

    // Sauvegarde de l'annonce mise à jour
    const updatedExchange = await exchange.save();
    res
      .status(200)
      .json({ message: "Annonce mise à jour avec succès.", updatedExchange });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'annonce." });
  }
};


/**
 * Supprime une annonce d'échange.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const deleteExchange = async (req, res) => {
  try {
    // Recherche de l'annonce d'échange par ID
    const exchange = await Exchange.findById(req.params.exchangeId);
    if (!exchange) {
      return res.status(404).json({ message: "Annonce non trouvée." });
    }

    // Vérification que l'utilisateur est bien celui qui a créé l'annonce
    if (exchange.createdBy.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Non autorisé à supprimer cette annonce." });
    }

    // Suppression de l'annonce
    await exchange.deleteOne();
    res.status(200).json({ message: "Annonce supprimée avec succès." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'annonce." });
  }
};

module.exports = {
  getExchanges,
  getExchangeById,
  createExchange,
  updateExchange,
  deleteExchange,
};
