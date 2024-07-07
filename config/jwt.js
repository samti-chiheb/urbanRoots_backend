const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const accessTokenExpiry = "1d";
const refreshTokenExpiry = "30d";
const refreshTokenCookie = 30 * 24 * 60 * 60 * 1000; // 30 jours

module.exports = {
  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiry,
  refreshTokenExpiry,
  refreshTokenCookie,
};
