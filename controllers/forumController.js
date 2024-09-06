const Forum = require("../model/Forum");
const ForumCategory = require("../model/ForumCategory");
const User = require("../model/User");

/**
 * Crée un nouveau forum.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const createForum = async (req, res) => {
  const { title, description, categories } = req.body;

  // Vérifie que tous les champs obligatoires sont remplis
  if (!title || !description || !categories || categories.length === 0) {
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

    // Vérifie que les catégories existent
    const validCategories = await ForumCategory.find({
      "_id": { $in: categories },
    });
    if (validCategories.length !== categories.length) {
      return res
        .status(400)
        .json({ message: "Certaines catégories sont invalides" });
    }

    // Crée un nouveau forum et sauvegarde dans la base de données
    const forum = new Forum({
      title,
      description,
      author: req.userId,
      categories,
    });
    const result = await forum.save();
    res.status(201).json(result);
  } catch (err) {
    // Gère les erreurs de sauvegarde
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère tous les forums.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getForums = async (req, res) => {
  try {
    // Récupère tous les forums et les données associées
    const forums = await Forum.find()
      .populate({
        path: "author",
        select: "-password -refreshToken",
      })
      .populate("categories");
    res.status(200).json(forums);
  } catch (err) {
    // Gère les erreurs de récupération
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère un forum spécifique par son ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getForumById = async (req, res) => {
  const { forumId } = req.params;

  try {
    // Récupère le forum par ID et les données associées
    const forum = await Forum.findById(forumId)
      .populate({
        path: "author",
        select: "-password -refreshToken",
      })
      .populate("categories");
    if (!forum) {
      return res.status(404).json({ message: "Forum non trouvé" });
    }
    res.status(200).json(forum);
  } catch (err) {
    // Gère les erreurs de récupération
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère un forum spécifique par son ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getForumByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    // Récupère le forum par ID et les données associées
    const forum = await Forum.find({
      categories: categoryId,
    })
      .populate({
        path: "author",
        select: "-password -refreshToken",
      })
      .populate("categories");

    if (!forum) {
      return res.status(404).json({ message: "Forum non trouvé" });
    }

    if (forum.length === 0) {
      return res.status(404).json({ message: "Forums non trouvés" });
    }

    res.status(200).json(forum);
  } catch (err) {
    // Gère les erreurs de récupération
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Met à jour un forum par son ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const updateForum = async (req, res) => {
  const { forumId } = req.params;
  const { title, description, categories } = req.body;

  try {
    // Vérifie que l'utilisateur existe
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifie que le forum existe
    const forum = await Forum.findById(forumId);
    if (!forum) {
      return res.status(404).json({ message: "Forum non trouvé" });
    }

    // Vérifie que les catégories existent et sont valides
    if (!Array.isArray(categories)) {
      return res
        .status(400)
        .json({ message: "Les catégories doivent être un tableau" });
    }

    const validCategories = await ForumCategory.find({
      "_id": { $in: categories },
    });
    if (validCategories.length !== categories.length) {
      return res
        .status(400)
        .json({ message: "Certaines catégories sont invalides" });
    }

    // Vérifie que l'utilisateur est soit l'auteur du forum, soit un admin
    if (
      forum.author.toString() !== req.userId &&
      !user.roles.includes("admin")
    ) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à modifier ce forum" }); // Updated message
    }

    // Met à jour les champs du forum
    forum.title = title || forum.title;
    forum.description = description || forum.description;
    forum.categories = categories || forum.categories;

    const updatedForum = await forum.save();
    res.status(200).json(updatedForum);
  } catch (err) {
    // Gère les erreurs de mise à jour
    console.error(err);
    res
      .status(500)
      .json({
        message: "Une erreur s'est produite lors de la mise à jour du forum",
      }); // Generic error message for the user
  }
};

/**
 * Supprime un forum par son ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const deleteForum = async (req, res) => {
  const { forumId } = req.params;

  try {
    // Vérifie que l'utilisateur existe
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifie que le forum existe
    const forum = await Forum.findById(forumId);
    if (!forum) {
      return res.status(404).json({ message: "Forum non trouvé" });
    }

    // Vérifie que l'utilisateur est soit l'auteur du forum, soit un admin
    if (
      forum.author.toString() !== req.userId &&
      !user.roles.includes("admin")
    ) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à supprimer ce forum" });
    }

    // Supprime le forum
    await forum.deleteOne();
    res.status(200).json({ message: "Forum supprimé" });
  } catch (err) {
    // Gère les erreurs de suppression
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Crée une nouvelle catégorie de forum.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ message: "Le nom de la catégorie est obligatoire" });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à créer une catégorie" });
    }

    const category = new ForumCategory({
      name,
    });

    const result = await category.save();
    res
      .status(201)
      .json({ message: "Catégorie créée avec succès", result: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère toutes les catégories de forum.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await ForumCategory.find();
    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère toutes les catégories de forum.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getCategoryById = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await ForumCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.status(200).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Met à jour une catégorie de forum par son ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à mettre à jour cette catégorie",
      });
    }

    const category = await ForumCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    category.name = name || category.name;

    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Supprime une catégorie de forum par son ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer cette catégorie",
      });
    }

    const category = await ForumCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    await category.deleteOne();
    res.status(200).json({ message: "Catégorie supprimée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createForum,
  getForums,
  getForumById,
  getForumByCategory,
  updateForum,
  deleteForum,
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
