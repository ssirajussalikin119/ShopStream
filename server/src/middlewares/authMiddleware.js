const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

// This middleware verifies JWT token and attaches the authenticated user to req.user.
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return sendResponse(res, 401, false, "Not authorized, token is missing");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return sendResponse(res, 401, false, "Not authorized, user not found");
    }

    if (!user.isActive) {
      return sendResponse(res, 403, false, "Account is inactive");
    }

    req.user = user;
    next();
  } catch (error) {
    return sendResponse(
      res,
      401,
      false,
      "Not authorized, token is invalid or expired",
    );
  }
});

// This middleware allows only users with specific roles to access a route.
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendResponse(
        res,
        401,
        false,
        "Not authorized, user context missing",
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendResponse(
        res,
        403,
        false,
        "Forbidden, insufficient permissions",
      );
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };
