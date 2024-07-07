const ForumPost = require("../model/ForumPost");
const Forum = require("../model/Forum");
const User = require("../model/User");

/**
 * Crée un nouveau post dans un forum.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const createPost = async (req, res) => {
  const { forumId } = req.params;
  const { title, content, tags } = req.body;

  if (!content || !title) {
    return res
      .status(400)
      .json({ message: "Le contenu et le titre sont obligatoire" });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const forum = await Forum.findById(forumId);
    if (!forum) {
      return res.status(404).json({ message: "Forum non trouvé" });
    }

    const post = new ForumPost({
      title,
      content,
      author: req.userId,
      forum: forumId,
      tags,
    });
    const result = await post.save();
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère tous les posts d'un forum.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getPostsByForum = async (req, res) => {
  const { forumId } = req.params;

  try {
    // Récupère tous les posts du forum et les données associées
    const posts = await ForumPost.find({ forum: forumId }).populate("author");
    res.status(200).json(posts);
  } catch (err) {
    // Gère les erreurs de récupération
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère un post spécifique par son ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getOnePost = async (req, res) => {
  const { postId } = req.params;

  try {
    // Récupère le post par ID et les données associées
    const post = await ForumPost.findById(postId).populate("author");
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }
    res.status(200).json(post);
  } catch (err) {
    // Gère les erreurs de récupération
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Met à jour un post par son ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  try {
    // Vérifie que l'utilisateur existe
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifie que le post existe
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    // Vérifie que l'utilisateur est l'auteur du post ou un admin
    if (
      post.author.toString() !== req.userId &&
      !user.roles.includes("admin")
    ) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à mettre à jour ce post" });
    }

    // Met à jour les champs du post
    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (err) {
    // Gère les erreurs de mise à jour
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Supprime un post par son ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    // Vérifie que l'utilisateur existe
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifie que le post existe
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    // Vérifie que l'utilisateur est l'auteur du post ou un admin
    if (
      post.author.toString() !== req.userId &&
      !user.roles.includes("admin")
    ) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à supprimer ce post" });
    }

    // Supprime le post
    await post.deleteOne();
    res.status(200).json({ message: "Post supprimé" });
  } catch (err) {
    // Gère les erreurs de suppression
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Liker un post.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const likePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    if (!post.likes.includes(req.userId)) {
      post.likes.push(req.userId);
      await post.save();
    }

    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Annuler le like d'un post.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const unlikePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    if (post.likes.includes(req.userId)) {
      post.likes.pull(req.userId);
      await post.save();
    }

    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPost,
  getPostsByForum,
  getOnePost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
};
