const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, generateShortToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    // Employers start inactive (must be verified by admin)
    const isActive = role !== 'employer';

    // Create user (password hashed via pre-save hook)
    const user = await User.create({ firstName, lastName, email, password, role, isActive });

    if (role === 'employer') {
      return sendSuccess(
        res,
        {
          user: user.toPublicJSON(),
        },
        'Employer account created successfully. It is pending admin verification before you can log in.',
        201
      );
    }

    // Generate auth token (for job seekers, etc.)
    const token = generateToken({ id: user._id, role: user.role });

    return sendSuccess(
      res,
      {
        token,
        user: user.toPublicJSON(),
      },
      'Account created successfully.',
      201
    );
  } catch (err) {
    console.error('Register error:', err);
    return sendError(res, 'Registration failed. Please try again.', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user WITH password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
      if (user.role === 'employer') {
        return sendError(res, 'Your employer account is pending admin verification.', 403);
      }
      return sendError(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken({ id: user._id, role: user.role });

    return sendSuccess(
      res,
      { token, user: user.toPublicJSON() },
      'Logged in successfully.'
    );
  } catch (err) {
    console.error('Login error:', err);
    return sendError(res, 'Login failed. Please try again.', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'User not found.', 404);

    return sendSuccess(res, { user: user.toPublicJSON() }, 'User fetched successfully.');
  } catch (err) {
    console.error('GetMe error:', err);
    return sendError(res, 'Failed to fetch user.', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update profile
// @route   PUT /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    // Fields that are NOT allowed to be updated via this endpoint
    const restricted = ['password', 'email', 'role', 'isActive', 'isEmailVerified'];
    restricted.forEach((field) => delete req.body[field]);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, { user: user.toPublicJSON() }, 'Profile updated successfully.');
  } catch (err) {
    console.error('UpdateProfile error:', err);
    return sendError(res, 'Failed to update profile.', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Change password (logged in)
// @route   PUT /api/auth/change-password
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return sendError(res, 'User not found.', 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 401);
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });

    return sendSuccess(res, { token }, 'Password changed successfully.');
  } catch (err) {
    console.error('ChangePassword error:', err);
    return sendError(res, 'Failed to change password.', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Forgot password — generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return sendSuccess(
        res,
        {},
        'If that email is registered, you will receive a reset link shortly.'
      );
    }

    // Generate raw token and store hashed version
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset link:
    // const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    // await sendEmail({ to: user.email, subject: 'Password Reset', resetUrl });

    console.log(`[DEV] Password reset token for ${email}: ${rawToken}`);

    return sendSuccess(
      res,
      {},
      'If that email is registered, you will receive a reset link shortly.'
    );
  } catch (err) {
    console.error('ForgotPassword error:', err);
    return sendError(res, 'Failed to process request.', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return sendError(res, 'Reset token is invalid or has expired.', 400);
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });

    return sendSuccess(res, { token }, 'Password reset successfully.');
  } catch (err) {
    console.error('ResetPassword error:', err);
    return sendError(res, 'Failed to reset password.', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete own account
// @route   DELETE /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    return sendSuccess(res, {}, 'Account deleted successfully.');
  } catch (err) {
    console.error('DeleteAccount error:', err);
    return sendError(res, 'Failed to delete account.', 500);
  }
};
