const Garden = require("../model/GardenSchema");
const User = require("../model/User");
const ROLES_LIST = require("../config/rolesList.js");

const validateLocation = (location) => {
  if (location.coordinates.type !== "Point") {
    return "Le type des coordonnées doit être 'Point'.";
  }
  if (
    !Array.isArray(location.coordinates.coordinates) ||
    location.coordinates.coordinates.length !== 2
  ) {
    return "Les coordonnées doivent être un tableau de deux nombres.";
  }
  if (
    typeof location.coordinates.coordinates[0] !== "number" ||
    typeof location.coordinates.coordinates[1] !== "number"
  ) {
    return "Les coordonnées doivent être des nombres valides.";
  }
  if (!/^\d{5}$/.test(location.address.postalCode)) {
    return "Le code postal doit être un nombre à 5 chiffres.";
  }
  return null;
};

/**
 * Crée un nouveau jardin urbain.
 *
 * Champs requis : name, location (address.street, address.city, address.postalCode, coordinates.type, coordinates.coordinates)
 *
 * @param {Object} req - L'objet de la requête contenant les données du jardin
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const createGarden = async (req, res) => {
  const {
    name,
    street,
    city,
    postalCode,
    type,
    latitude,
    longitude,
    description,
  } = req.body;

  // Vérification des champs requis
  if (!name) return res.status(400).json({ message: "Nom requis." });
  if (!street || !city || !postalCode || !type || !latitude || !longitude) {
    return res
      .status(400)
      .json({ message: "Tous les champs de localisation sont requis." });
  }

  const location = {
    address: {
      street,
      city,
      postalCode,
    },
    coordinates: {
      type,
      coordinates: [parseFloat(latitude), parseFloat(longitude)],
    },
  };

  // Validation des données de location
  const locationError = validateLocation(location);
  if (locationError) {
    return res.status(400).json({ message: locationError });
  }

  try {
    // Vérification de l'utilisateur
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Création et sauvegarde du nouveau jardin
    const newGarden = new Garden({
      name,
      location,
      description,
      author: req.userId,
    });
    const garden = await newGarden.save();
    res.status(201).json(garden);
  } catch (error) {
    res.status(500).json({ message: "Erreur de création." });
  }
};

/**
 * Obtenir tous les jardins urbains.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getGardens = async (req, res) => {
  try {
    const gardens = await Garden.find().populate({
      path: "author",
      select: "-password -refreshToken",
    });
    res.status(200).json(gardens);
  } catch (error) {
    res.status(500).json({ message: "Erreur de récupération des jardins." });
  }
};

/**
 * Obtenir un jardin urbain par ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getGardenById = async (req, res) => {
  try {
    const garden = await Garden.findById(req.params.gardenId).populate({
      path: "author",
      select: "-password -refreshToken",
    });
    if (!garden) {
      return res.status(404).json({ message: "Jardin non trouvé." });
    }
    res.status(200).json(garden);
  } catch (error) {
    res.status(500).json({ message: "Erreur de récupération du jardin." });
  }
};

/**
 * Mettre à jour un jardin urbain.
 *
 * Champs requis : id
 *
 * @param {Object} req - L'objet de la requête contenant les données mises à jour du jardin
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const updateGarden = async (req, res) => {
  const {
    name,
    street,
    city,
    postalCode,
    type,
    latitude,
    longitude,
    description,
  } = req.body;
  const userId = req.userId;

  // Vérification de la présence d'au moins un des champs requis dans la requête
  if (
    !name &&
    !street &&
    !city &&
    !postalCode &&
    !type &&
    !latitude &&
    !longitude &&
    description === undefined
  ) {
    return res.status(400).json({
      message: "Au moins un champ doit être fourni pour la mise à jour.",
    });
  }

  try {
    // Vérification de l'existence de l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérification de l'existence du jardin urbain
    const garden = await Garden.findById(req.params.gardenId);
    if (!garden) {
      return res.status(404).json({ message: "Jardin non trouvé." });
    }

    // Vérification que l'utilisateur est l'auteur du jardin ou qu'il est admin
    const isAdmin = req.roles && req.roles.includes(ROLES_LIST.admin);

    if (garden.author.toString() !== userId && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Non autorisé à mettre à jour ce jardin." });
    }

    const updatedFields = {};

    // Mise à jour des champs si présents dans la requête
    if (name) {
      garden.name = name;
      updatedFields.name = name;
    }
    if (street) {
      garden.location.address.street = street;
      updatedFields.street = street;
    }
    if (city) {
      garden.location.address.city = city;
      updatedFields.city = city;
    }
    if (postalCode) {
      garden.location.address.postalCode = postalCode;
      updatedFields.postalCode = postalCode;
    }
    if (latitude !== undefined && longitude !== undefined) {
      garden.location.coordinates.coordinates = [parseFloat(latitude), parseFloat(longitude)];
      updatedFields.coordinates = [parseFloat(latitude), parseFloat(longitude)];
    }
    if (type) {
      garden.location.coordinates.type = type;
      updatedFields.type = type;
    }
    if (description !== undefined) {
      garden.description = description;
      updatedFields.description = description;
    }

    const updatedGarden = await garden.save();
    res.status(200).json({
      message: "Mise à jour réussie.",
      updatedFields: updatedFields,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur de mise à jour du jardin." });
  }
};

/**
 * Supprimer un jardin urbain.
 *
 * Champs requis : id
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const deleteGarden = async (req, res) => {
  const { userId } = req;

  try {
    // Vérification de l'existence de l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérification de l'existence du jardin urbain
    const garden = await Garden.findById(req.params.gardenId);
    if (!garden) {
      return res.status(404).json({ message: "Jardin non trouvé." });
    }

    // Vérification que l'utilisateur est l'auteur du jardin ou qu'il est admin
    const isAdmin = req.roles && req.roles.includes(ROLES_LIST.admin);
    if (garden.author.toString() !== userId && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Non autorisé à supprimer ce jardin." });
    }

    // Suppression du jardin urbain
    await garden.deleteOne();
    res.status(200).json({ message: "Jardin supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur de suppression du jardin." });
  }
};

module.exports = {
  createGarden,
  getGardens,
  getGardenById,
  updateGarden,
  deleteGarden,
};
