const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendResponse = require('../utils/sendResponse');
const asyncHandler = require('../utils/asyncHandler');
const ROLES = require('../constants/roles');

const getRolesFromAccountType = (accountType) => {
  if (accountType === 'seller') {
    return { primaryRole: ROLES.SELLER, roles: [ROLES.SELLER] };
  }

  if (accountType === 'both') {
    return {
      primaryRole: ROLES.USER,
      roles: [ROLES.USER, ROLES.SELLER],
    };
  }

  return { primaryRole: ROLES.USER, roles: [ROLES.USER] };
};

// REGISTER - Create a new user account
const register = asyncHandler(async (req, res) => {
  // Check if validation failed
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, errors.array()[0].msg);
  }

  const { name, email, password, accountType } = req.body;
  const normalizedEmail = email.toLowerCase();
  const normalizedAccountType = accountType || 'customer';
  const { primaryRole, roles } = getRolesFromAccountType(normalizedAccountType);

  // Check if user already exists with this email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return sendResponse(res, 409, false, 'User already exists with this email');
  }

  // Create new user in database
  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: primaryRole,
    roles,
    accountType: normalizedAccountType,
  });

  // Generate JWT token
  const token = generateToken(user._id, user.role);

  return sendResponse(res, 201, true, 'Account created successfully', {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    accountType: user.accountType,
    shopName: user.shopName,
    shopLogo: user.shopLogo,
    token,
  });
});

// LOGIN - Login with existing account
const login = asyncHandler(async (req, res) => {
  // Check if validation failed
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, errors.array()[0].msg);
  }

  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  // Find user by email
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return sendResponse(res, 401, false, 'Invalid email or password');
  }

  // Prevent inactive users from logging in
  if (!user.isActive) {
    return sendResponse(res, 403, false, 'Account is inactive');
  }

  // Check if password is correct
  const isPasswordCorrect = await user.matchPassword(password);
  if (!isPasswordCorrect) {
    return sendResponse(res, 401, false, 'Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken(user._id, user.role);

  return sendResponse(res, 200, true, 'Login successful', {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    accountType: user.accountType,
    shopName: user.shopName,
    shopLogo: user.shopLogo,
    token,
  });
});

// GET PROFILE - Return authenticated user profile
const getMe = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, true, 'User profile fetched successfully', {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    accountType: req.user.accountType,
    shopName: req.user.shopName,
    shopLogo: req.user.shopLogo,
    avatar: req.user.avatar,
    isActive: req.user.isActive,
    createdAt: req.user.createdAt,
    updatedAt: req.user.updatedAt,
  });
});

module.exports = { register, login, getMe };
