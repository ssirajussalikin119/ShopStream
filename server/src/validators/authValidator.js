const { body } = require('express-validator');

// Rules that check if register data is valid before saving
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('accountType')
    .optional()
    .isIn(['customer', 'seller', 'both'])
    .withMessage('Account type must be customer, seller, or both'),
];

// Rules that check if login data is valid before processing
const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),

  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidator, loginValidator };
