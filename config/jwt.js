const jwtConfig = {
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  accessTokenExpiry: "15m",
  refreshTokenExpiry: "30d",
  refreshTokenCookie: 30 * 24 * 60 * 60 * 1000, // 30 jours
};

module.exports = {
  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiry,
  refreshTokenExpiry,
  refreshTokenCookie,
};
