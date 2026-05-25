const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT for a user
 * @param {Object} payload - Data to embed (e.g. { id, role })
 * @returns {string} signed JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify and decode a JWT
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Generate a short-lived token (e.g. for email verification / password reset)
 * @param {Object} payload
 * @param {string} expiresIn - e.g. '1h', '15m'
 */
const generateShortToken = (payload, expiresIn = '1h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

module.exports = { generateToken, verifyToken, generateShortToken };
