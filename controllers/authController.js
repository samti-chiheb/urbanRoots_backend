const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiry,
  refreshTokenExpiry,
  refreshTokenCookie,
} = require("../config/jwt");

/**
 * Enregistre un nouvel utilisateur.
 *
 * Cette fonction prend les données d'inscription de l'utilisateur à partir du corps de la requête,
 * vérifie les doublons de noms d'utilisateur et d'emails, chiffre le mot de passe, et crée un nouvel utilisateur
 * dans la base de données. Les champs optionnels seront enregistrés avec des valeurs `null` si non fournis.
 *
 * Champs requis :[firstname, lastname, username, email, password]
 * Champs optionnels : [profilePhoto , bio , location , socialLinks , website]
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const register = async (req, res) => {
  const {
    firstname,
    lastname,
    username,
    email,
    password,
    profilePhoto,
    bio,
    location,
    socialLinks,
    website,
  } = req.body;

  // Vérification des champs obligatoires
  if (!firstname || !lastname || !username || !email || !password) {
    return res.status(400).json({
      "message": "Tous les champs obligatoires doivent être remplis !",
    });
  }

  // Vérification des doublons pour les noms d'utilisateur et les emails
  const duplicateUsername = await User.findOne({ username }).exec();
  if (duplicateUsername) {
    return res
      .status(400)
      .json({ "message": "Le nom d'utilisateur existe déjà !" });
  }

  const duplicateEmail = await User.findOne({ email }).exec();
  if (duplicateEmail) {
    return res.status(400).json({ "message": "L'email existe déjà !" });
  }

  try {
    //encrypte the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création et enregistrement du nouvel utilisateur
    const result = await User.create({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      profilePhoto,
      bio,
      location,
      socialLinks,
      website,
    });
    console.log(result);

    res.status(201).json({
      "success": `Nouvel utilisateur ${username} créé !`,
    });
  } catch (err) {
    res.status(500).json({ "err message": err.message });
  }
};

/**
 * Authentifie un utilisateur.
 *
 * Cette fonction prend les données de connexion de l'utilisateur à partir du corps de la requête,
 * vérifie si l'utilisateur existe dans la base de données, compare le mot de passe fourni avec le mot de passe
 * enregistré, et génère des jetons JWT pour l'authentification. Le refresh token est stocké dans la base de données.
 *
 * Champs requis :
 * - username ou email
 * - password
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const login = async (req, res) => {
  const { username, email, password } = req.body;

  if ((!username && !email) || !password) {
    return res.status(400).json({
      "message":
        "Le nom d'utilisateur ou l'email et le mot de passe sont requis !",
    });
  }

  // Chercher l'utilisateur par username ou email
  const foundUser = await User.findOne({
    $or: [{ username }, { email }],
  }).exec();

  if (!foundUser) return res.sendStatus(401); // Non autorisé

  // Évaluer le mot de passe
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles).filter(Boolean);

    // Créer les JWT
    const accessToken = jwt.sign(
      {
        "userInfo": {
          "id": foundUser.id,
          "username": foundUser.username,
          "roles": roles,
        },
      },
      accessTokenSecret,
      { expiresIn: accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      { "id": foundUser.id, "username": foundUser.username },
      refreshTokenSecret,
      { expiresIn: refreshTokenExpiry }
    );

    // Enregistrer le refreshToken avec l'utilisateur actuel
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    console.log(result);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      // secure: true, // à activer en production
      maxAge: refreshTokenCookie,
    });
    res.json({ "accessToken": accessToken });
  } else {
    res.sendStatus(401); // Non autorisé
  }
};

/**
 * Génère un nouveau accessToken en utilisant le refresh token.
 *
 * Cette fonction vérifie le refresh token stocké dans les HttpOnly cookies,
 * vérifie sa validité et génère un nouveau accessToken.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const getAccessToken = async (req, res) => {
  const cookies = req.cookies;
  console.log(cookies);
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;
  const foundUser = await User.findOne({ refreshToken }).exec();

  if (!foundUser) return res.sendStatus(403); // Forbidden

  jwt.verify(refreshToken, refreshTokenSecret, (err, decoded) => {
    // to check : decoded and jwt payload
    if (err || foundUser.id !== decoded.id) return res.sendStatus(403); // Forbidden

    const roles = Object.values(foundUser.roles).filter(Boolean);

    // Créer le accessToken
    const accessToken = jwt.sign(
      {
        "userInfo": {
          "id": foundUser.id,
          "username": foundUser.username,
          "roles": roles,
        },
      },
      accessTokenSecret,
      { expiresIn: accessTokenExpiry }
    );

    res.json({ accessToken });
  });
};

/**
 * Met à jour les informations générales d'un utilisateur.
 *
 * Cette fonction prend les données de mise à jour de l'utilisateur à partir du corps de la requête,
 * vérifie l'existence de l'utilisateur dans la base de données, et met à jour les informations fournies.
 *
 * Champs requis : id
 * Champs optionnels : firstname, lastname, profilePhoto, bio, location, socialLinks, website
 *
 * @param {Object} req - L'objet de la requête contenant les données de mise à jour de l'utilisateur
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const updateUserInfo = async (req, res) => {
  // toDO : optimise le userId in update functions
  const { userId } = req;

  if (!userId) {
    const { userId } = req.body;
  }

  const { ...updates } = req.body;

  // Vérification de l'ID de l'utilisateur
  if (!userId) {
    return res.status(400).json({ "message": "Un paramètre 'id' est requis." });
  }

  try {
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(204).json({
        "message": `Aucun utilisateur ne correspond à l'ID : ${userId}.`,
      });
    }

    // Mise à jour des champs
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        user[key] = updates[key];
      }
    }

    const result = await user.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ "message": err.message });
  }
};

/**
 * Met à jour le nom d'utilisateur d'un utilisateur.
 *
 * Cette fonction vérifie si le nouveau nom d'utilisateur existe déjà dans la base de données.
 * Si le nom d'utilisateur est unique, il est mis à jour.
 *
 * Champs requis : id, username
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const updateUsername = async (req, res) => {
  const { id, username } = req.body;

  if (!id || !username) {
    return res
      .status(400)
      .json({ "message": "L'ID et le nom d'utilisateur sont requis." });
  }

  try {
    const user = await User.findById(id).exec();
    if (!user) {
      return res
        .status(204)
        .json({ "message": `Aucun utilisateur ne correspond à l'ID : ${id}.` });
    }

    const duplicateUsername = await User.findOne({ username }).exec();
    if (duplicateUsername) {
      return res
        .status(400)
        .json({ "message": "Le nom d'utilisateur existe déjà !" });
    }

    user.username = username;
    const result = await user.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ "message": err.message });
  }
};

/**
 * Met à jour l'email d'un utilisateur.
 *
 * Cette fonction vérifie si le nouvel email existe déjà dans la base de données.
 * Si l'email est unique, il est mis à jour.
 *
 * Champs requis :id, email
 *
 * @param {Object} req - L'objet de la requête contenant les données de mise à jour de l'utilisateur
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const updateEmail = async (req, res) => {
  const { id, email } = req.body;

  if (!id || !email) {
    return res.status(400).json({ "message": "L'ID et l'email sont requis." });
  }

  try {
    const user = await User.findById(id).exec();
    if (!user) {
      return res
        .status(204)
        .json({ "message": `Aucun utilisateur ne correspond à l'ID : ${id}.` });
    }

    const duplicateEmail = await User.findOne({ email }).exec();
    if (duplicateEmail) {
      return res.status(400).json({ "message": "L'email existe déjà !" });
    }

    user.email = email;
    const result = await user.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ "message": err.message });
  }
};

/**
 * Met à jour le mot de passe d'un utilisateur.
 *
 * Cette fonction chiffre le nouveau mot de passe avant de le mettre à jour.
 *
 * Champs requis : id, password
 *
 * @param {Object} req - L'objet de la requête contenant les données de mise à jour de l'utilisateur
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const updatePassword = async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res
      .status(400)
      .json({ "message": "L'ID et le mot de passe sont requis." });
  }

  try {
    const user = await User.findById(id).exec();
    if (!user) {
      return res
        .status(204)
        .json({ "message": `Aucun utilisateur ne correspond à l'ID : ${id}.` });
    }

    user.password = await bcrypt.hash(password, 10);
    const result = await user.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ "message": err.message });
  }
};

/**
 * Déconnecte un utilisateur.
 *
 * Cette fonction supprime le refresh token du cookie côté client et de la base de données,
 * permettant ainsi de déconnecter l'utilisateur. Si aucun cookie n'est trouvé, une réponse 204 est envoyée.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const logout = async (req, res) => {
  // Supprimer également le accessToken
  const cookies = req.cookies;
  if (!cookies?.jwt)
    return res
      .status(200)
      .json({ "message": "Aucun utilisateur n'est connecté." });

  const refreshToken = cookies.jwt;

  // Le refreshToken est-il dans la base de données ?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      // secure: true, // À activer en production
    });
    return res.status(204).json({ "message": "Vous étes déja déconnecté." }); // Aucun contenu
  }

  // Supprimer le refreshToken dans la base de données
  foundUser.refreshToken = "";
  const result = await foundUser.save();

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    // secure: true // À activer en production
  });
  res.status(200).json({ "message": "Déconnexion réussie." });
};

/**
 * Supprime un utilisateur.
 *
 * Cette fonction supprime un utilisateur de la base de données en utilisant son identifiant.
 *
 * Champs requis : id
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @returns {void}
 */
const deleteUser = async (req, res) => {
  const { id } = req.body;

  // Vérification de l'ID de l'utilisateur
  if (!id) {
    return res.status(400).json({ "message": "Un paramètre 'id' est requis." });
  }

  try {
    const user = await User.findById(id).exec();
    if (!user) {
      return res
        .status(204)
        .json({ "message": `Aucun utilisateur ne correspond à l'ID : ${id}.` });
    }

    // toDo : confirmer deleteUser using password

    const result = await user.deleteOne();
    res.json({ "message": `Utilisateur avec l'ID ${id} supprimé.`, result });
  } catch (err) {
    res.status(500).json({ "message": err.message });
  }
};

module.exports = {
  register,
  login,
  updateUserInfo,
  updateUsername,
  updateEmail,
  updatePassword,
  logout,
  getAccessToken,
  deleteUser,
};
