const jwt = require("jsonwebtoken");

// This function creates a JWT token for a logged in user
// The token is like a digital ID card - it proves who the user is
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role: role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = generateToken;
