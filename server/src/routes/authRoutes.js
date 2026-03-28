const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

// POST /api/auth/register - Create new account
router.post("/register", registerValidator, register);

// POST /api/auth/login - Login to account
router.post("/login", loginValidator, login);

// GET /api/auth/me - Get current logged in user profile
router.get("/me", protect, getMe);

module.exports = router;
