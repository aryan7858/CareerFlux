const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const User = require('../models/User');

/**
 * Protect middleware — verifies JWT and attaches user to req
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Accept token from Authorization header: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Also accept token from cookie (optional)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // Also accept token from query parameter (for SSE EventSource)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user (minus password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 'User no longer exists.', 401);
    }

    if (!user.isActive) {
      if (user.role === 'employer') {
        return sendError(res, 'Your employer account is pending admin verification.', 403);
      }
      return sendError(res, 'Your account has been deactivated.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token.', 401);
    }
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired. Please log in again.', 401);
    }
    return sendError(res, 'Authentication failed.', 500);
  }
};

/**
 * Authorize middleware — restrict to specific roles
 * Usage: authorize('admin', 'employer')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return sendError(
        res,
        `Role '${req.user?.role}' is not authorized to access this route.`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
