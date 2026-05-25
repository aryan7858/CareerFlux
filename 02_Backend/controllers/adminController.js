const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { sendSuccess, sendError } = require('../utils/response');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalJobseekers,
            totalEmployers,
            totalJobs,
            activeJobs,
            totalApplications,
            recentUsers,
            recentJobs,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'jobseeker' }),
            User.countDocuments({ role: 'employer' }),
            Job.countDocuments(),
            Job.countDocuments({ isActive: true }),
            Application.countDocuments(),
            User.find().sort('-createdAt').limit(5).select('firstName lastName email role createdAt'),
            Job.find().sort('-createdAt').limit(5).select('title company type createdAt'),
        ]);

        // Application status breakdown
        const statusBreakdown = await Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        return sendSuccess(res, {
            stats: {
                totalUsers,
                totalJobseekers,
                totalEmployers,
                totalJobs,
                activeJobs,
                totalApplications,
                statusBreakdown,
            },
            recentUsers,
            recentJobs,
        });
    } catch (err) {
        console.error('GetDashboardStats error:', err);
        return sendError(res, 'Failed to fetch statistics.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await User.countDocuments(query);

        const users = await User.find(query)
            .select('-password')
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit));

        return sendSuccess(res, {
            users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('GetAllUsers error:', err);
        return sendError(res, 'Failed to fetch users.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update user status (activate/deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return sendError(res, 'User not found.', 404);
        }

        // Prevent admin from deactivating themselves
        if (req.params.id === req.user._id.toString()) {
            return sendError(res, 'Cannot change your own status.', 400);
        }

        user.isActive = isActive;
        await user.save({ validateBeforeSave: false });

        return sendSuccess(res, { user: user.toPublicJSON() }, `User ${isActive ? 'activated' : 'deactivated'}.`);
    } catch (err) {
        console.error('UpdateUserStatus error:', err);
        return sendError(res, 'Failed to update user status.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return sendError(res, 'Cannot delete your own account from admin panel.', 400);
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return sendError(res, 'User not found.', 404);
        }

        return sendSuccess(res, {}, 'User deleted successfully.');
    } catch (err) {
        console.error('DeleteUser error:', err);
        return sendError(res, 'Failed to delete user.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all jobs (admin view - includes inactive)
// @route   GET /api/admin/jobs
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllJobs = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await Job.countDocuments(query);

        const jobs = await Job.find(query)
            .populate('postedBy', 'firstName lastName email companyName')
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit));

        return sendSuccess(res, {
            jobs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('GetAllJobs error:', err);
        return sendError(res, 'Failed to fetch jobs.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete any job (admin)
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.adminDeleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) {
            return sendError(res, 'Job not found.', 404);
        }

        return sendSuccess(res, {}, 'Job deleted successfully.');
    } catch (err) {
        console.error('AdminDeleteJob error:', err);
        return sendError(res, 'Failed to delete job.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create pre-approved employer (admin)
// @route   POST /api/admin/users/employer
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.createEmployer = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return sendError(res, 'All fields are required.', 400);
        }

        if (password.length < 8) {
            return sendError(res, 'Password must be at least 8 characters.', 400);
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 'An account with this email already exists.', 409);
        }

        // Create employer (isActive = true since created by admin)
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: 'employer',
            isActive: true,
        });

        return sendSuccess(
            res,
            { user: user.toPublicJSON() },
            'Employer account created successfully.',
            201
        );
    } catch (err) {
        console.error('CreateEmployer error:', err);
        return sendError(res, 'Failed to create employer account.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update job status (activate/deactivate)
// @route   PUT /api/admin/jobs/:id/status
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.adminUpdateJobStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        const job = await Job.findById(req.params.id);
        if (!job) {
            return sendError(res, 'Job not found.', 404);
        }

        job.isActive = isActive;
        await job.save();

        return sendSuccess(res, { job }, `Job status updated to ${isActive ? 'Active' : 'Closed'}.`);
    } catch (err) {
        console.error('adminUpdateJobStatus error:', err);
        return sendError(res, 'Failed to update job status.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all applications (admin view)
// @route   GET /api/admin/applications
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllApplications = async (req, res) => {
    try {
        const { page = 1, limit = 50, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (status) query.status = status;

        const total = await Application.countDocuments(query);

        const applications = await Application.find(query)
            .populate('job', 'title company')
            .populate('applicant', 'firstName lastName email')
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit));

        return sendSuccess(res, {
            applications,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('getAllApplications error:', err);
        return sendError(res, 'Failed to fetch applications.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete any application (admin)
// @route   DELETE /api/admin/applications/:id
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.adminDeleteApplication = async (req, res) => {
    try {
        const application = await Application.findByIdAndDelete(req.params.id);
        if (!application) {
            return sendError(res, 'Application not found.', 404);
        }
        return sendSuccess(res, {}, 'Application deleted successfully.');
    } catch (err) {
        console.error('adminDeleteApplication error:', err);
        return sendError(res, 'Failed to delete application.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all pending verifications
// @route   GET /api/admin/verifications
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.getPendingVerifications = async (req, res) => {
    try {
        const users = await User.find({ verificationStatus: 'pending' })
            .select('firstName lastName email role companyName industry verificationStatus verificationDocUrl createdAt');

        return sendSuccess(res, { users }, 'Pending verifications retrieved.');
    } catch (err) {
        console.error('getPendingVerifications error:', err);
        return sendError(res, 'Failed to fetch pending verifications.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Review user verification (approve/reject)
// @route   PUT /api/admin/verifications/:userId
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.reviewVerification = async (req, res) => {
    try {
        const { status } = req.body; // 'verified' or 'rejected'
        const { userId } = req.params;

        if (!['verified', 'rejected'].includes(status)) {
            return sendError(res, 'Invalid verification status. Must be "verified" or "rejected".', 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            return sendError(res, 'User not found.', 404);
        }

        user.verificationStatus = status;
        user.isVerified = status === 'verified';
        await user.save({ validateBeforeSave: false });

        // Trigger real-time notification alert to user
        try {
            const notificationService = require('../utils/notificationService');
            await notificationService.createNotification({
                recipient: user._id,
                sender: req.user._id,
                type: 'reply',
                title: status === 'verified' ? 'Profile Verified! 🛡️' : 'Verification Rejected ❌',
                message: status === 'verified' 
                    ? 'Congratulations! Your profile has been verified and you have received the verification checkmark.'
                    : 'Your verification request could not be approved. Please submit a valid document for review.',
                link: '/dashboard'
            });
        } catch (notifErr) {
            console.error('Failed to notify user about verification result:', notifErr.message);
        }

        return sendSuccess(res, { user: user.toPublicJSON() }, `Verification status updated to ${status}.`);
    } catch (err) {
        console.error('reviewVerification error:', err);
        return sendError(res, 'Failed to review verification.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Download verification document securely
// @route   GET /api/admin/verifications/download/:userId
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.downloadVerificationDoc = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user || !user.verificationDocUrl) {
            return sendError(res, 'Verification document not found.', 404);
        }

        const path = require('path');
        const fs = require('fs');
        const fileLocation = path.join(__dirname, '..', user.verificationDocUrl);

        if (!fs.existsSync(fileLocation)) {
            return sendError(res, 'File does not exist on server.', 404);
        }

        res.download(fileLocation, `Verification-${user.firstName}-${user.lastName || 'User'}${path.extname(fileLocation)}`);
    } catch (err) {
        console.error('downloadVerificationDoc error:', err);
        return sendError(res, 'Failed to download document.', 500);
    }
};

