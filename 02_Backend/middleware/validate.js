const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Run after validation rules — returns 422 with errors if invalid
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }
  next();
};

// ── Register Validation Rules ─────────────────────────────────────────────────
const registerRules = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),

  body('lastName')
    .trim()
    .optional()
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(['jobseeker', 'employer']).withMessage('Role must be jobseeker or employer'),
];

// ── Login Validation Rules ────────────────────────────────────────────────────
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── Change Password Rules ─────────────────────────────────────────────────────
const changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// ── Forgot Password Rules ─────────────────────────────────────────────────────
const forgotPasswordRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
];

// ── Reset Password Rules ──────────────────────────────────────────────────────
const resetPasswordRules = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
};
