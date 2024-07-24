const jwt = require("jsonwebtoken");
const { accessTokenSecret, refreshTokenSecret } = require("../config/jwt");

/**
 * Middleware pour vérifier le JWT.
 *
 * Cette fonction middleware vérifie le token JWT dans l'en-tête Authorization de la requête.
 * Si le token est valide, l'utilisateur et les rôles sont ajoutés à l'objet req.
 * Sinon, une réponse 401 ou 403 est renvoyée.
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse
 * @param {Function} next - La fonction suivante à appeler
 * @returns {void}
 */
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  jwt.verify(token, accessTokenSecret, (err, decoded) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.userId = decoded.userInfo.id;
    req.username = decoded.userInfo.username;
    req.roles = decoded.userInfo.roles;
    next();
  });
};

module.exports = verifyJWT;
