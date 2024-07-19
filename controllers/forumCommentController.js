const ForumPost = require("../model/ForumPost");
const User = require("../model/User");
const ForumComment = require("../model/ForumComment");

/**
 * Crée un nouveau commentaire sur un post.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Le contenu est obligatoire" });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    // Crée et sauvegarde le commentaire dans la base de données
    const comment = await ForumComment.create({
      content,
      author: req.userId,
      post: postId,
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère tous les commentaires d'un post.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getCommentsByPost = async (req, res) => {
  const { postId } = req.params;

  try {
    // Récupère tous les commentaires du post et les données associées
    const comments = await ForumComment.find({ post: postId }).populate({
      path: "author",
      select: "-password -refreshToken",
    });
    res.status(200).json(comments);
  } catch (err) {
    // Gère les erreurs de récupération
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Met à jour un commentaire par son ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    // Vérifie que l'utilisateur existe
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifie que le commentaire existe
    const comment = await ForumComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    // Vérifie que l'utilisateur est l'auteur du commentaire ou un admin
    if (
      comment.author.toString() !== req.userId &&
      !user.roles.includes("admin")
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à mettre à jour ce commentaire",
      });
    }

    // Met à jour le contenu du commentaire
    comment.content = content || comment.content;

    const updatedComment = await comment.save();
    res.status(200).json(updatedComment);
  } catch (err) {
    // Gère les erreurs de mise à jour
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Supprime un commentaire par son ID.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    // Vérifie que l'utilisateur existe
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifie que le commentaire existe
    const comment = await ForumComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    // Vérifie que l'utilisateur est l'auteur du commentaire ou un admin
    if (
      comment.author.toString() !== req.userId &&
      !user.roles.includes("admin")
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer ce commentaire",
      });
    }

    // Supprime le commentaire
    await comment.deleteOne();
    res.status(200).json({ message: "Commentaire supprimé" });
  } catch (err) {
    // Gère les erreurs de suppression
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Vote pour un commentaire (upvote).
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const upvoteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const comment = await ForumComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    if (!comment.upvotes.includes(req.userId)) {
      comment.upvotes.push(req.userId);
      comment.downvotes.pull(req.userId); // Enlève le downvote si présent
      await comment.save();
    }

    res.status(200).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Vote contre un commentaire (downvote).
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const downvoteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const comment = await ForumComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    if (!comment.downvotes.includes(req.userId)) {
      comment.downvotes.push(req.userId);
      comment.upvotes.pull(req.userId); // Enlève l'upvote si présent
      await comment.save();
    }

    res.status(200).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  upvoteComment,
  downvoteComment,
};
