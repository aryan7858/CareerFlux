const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { authLimiter, strictLimiter } = require('../middleware/rateLimiter');

const {
  validate,
  registerRules,
  loginRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../middleware/validate');

// ─── Public Routes ────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', authLimiter, registerRules, validate, register);

// POST /api/auth/login
router.post('/login', authLimiter, loginRules, validate, login);

// POST /api/auth/forgot-password
router.post('/forgot-password', strictLimiter, forgotPasswordRules, validate, forgotPassword);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', resetPasswordRules, validate, resetPassword);

// ─── Protected Routes (require valid JWT) ─────────────────────────────────────

// GET  /api/auth/me
router.get('/me', protect, getMe);

// PUT  /api/auth/me
router.put('/me', protect, updateProfile);

// PUT  /api/auth/change-password
router.put('/change-password', protect, changePasswordRules, validate, changePassword);

// DELETE /api/auth/me
router.delete('/me', protect, deleteAccount);

module.exports = router;
