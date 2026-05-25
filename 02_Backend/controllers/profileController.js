const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { sendSuccess, sendError } = require('../utils/response');

// POST /api/profile/portfolio/upload
exports.uploadPortfolio = async (req, res) => {
    try {
        const { title, description, projectUrl } = req.body;
        if (!title) {
            return sendError(res, 'Project title is required', 400);
        }

        const project = {
            title,
            description,
            projectUrl,
        };

        if (req.file) {
            project.fileUrl = `/uploads/portfolio/${req.file.filename}`;
            project.fileName = req.file.originalname;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $push: { portfolioProjects: project } },
            { new: true }
        );

        return sendSuccess(res, { user: user.toPublicJSON() }, 'Portfolio project added successfully.', 201);
    } catch (err) {
        console.error('uploadPortfolio error:', err);
        return sendError(res, 'Failed to upload portfolio project.', 500);
    }
};

// DELETE /api/profile/portfolio/:projectId
exports.deletePortfolio = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return sendError(res, 'User not found.', 404);
        }

        const project = user.portfolioProjects.id(req.params.projectId);
        if (!project) {
            return sendError(res, 'Portfolio project not found.', 404);
        }

        // If there is an uploaded file, delete it from disk
        if (project.fileUrl) {
            // fileUrl looks like `/uploads/portfolio/filename`
            // path.join resolves relative to __dirname (which is in controllers/)
            const filePath = path.join(__dirname, '..', project.fileUrl);
            fs.unlink(filePath, (err) => {
                if (err) console.error('Failed to delete file from disk:', err.message);
            });
        }

        user.portfolioProjects.pull(req.params.projectId);
        await user.save();

        return sendSuccess(res, { user: user.toPublicJSON() }, 'Portfolio project deleted successfully.');
    } catch (err) {
        console.error('deletePortfolio error:', err);
        return sendError(res, 'Failed to delete portfolio project.', 500);
    }
};

// POST /api/profile/users/:userId/endorse/:skill
exports.toggleEndorsement = async (req, res) => {
    try {
        const { userId, skill } = req.params;
        const byUserId = req.user._id;

        // Prevent endorsing yourself
        if (userId === byUserId.toString()) {
            return sendError(res, 'You cannot endorse your own skills.', 400);
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return sendError(res, 'Target user not found.', 404);
        }

        // Check if target user has the skill listed
        const hasSkill = targetUser.skills.some(s => s.toLowerCase() === skill.toLowerCase());
        if (!hasSkill) {
            return sendError(res, 'User does not have this skill listed.', 400);
        }

        // Check if already endorsed
        const existingIndex = targetUser.endorsements.findIndex(
            e => e.skill.toLowerCase() === skill.toLowerCase() && e.byUser.toString() === byUserId.toString()
        );

        if (existingIndex > -1) {
            // Remove endorsement (toggle)
            targetUser.endorsements.splice(existingIndex, 1);
            await targetUser.save();
            return sendSuccess(res, { endorsements: targetUser.endorsements }, 'Endorsement removed.');
        } else {
            // Add endorsement
            targetUser.endorsements.push({ skill, byUser: byUserId });
            await targetUser.save();
            
            // Trigger a real-time notification to target user!
            try {
                const notificationService = require('../utils/notificationService');
                await notificationService.createNotification({
                    recipient: targetUser._id,
                    sender: byUserId,
                    type: 'reply',
                    title: 'New Skill Endorsement! 🌟',
                    message: `${req.user.firstName} endorsed your skill: "${skill}".`,
                    link: '/profile'
                });
            } catch (notifErr) {
                console.error('Failed to send endorsement notification:', notifErr.message);
            }

            return sendSuccess(res, { endorsements: targetUser.endorsements }, 'Skill endorsed successfully!');
        }
    } catch (err) {
        console.error('toggleEndorsement error:', err);
        return sendError(res, 'Failed to toggle endorsement.', 500);
    }
};

// POST /api/profile/verify/request
exports.requestVerification = async (req, res) => {
    try {
        if (!req.file) {
            return sendError(res, 'Verification document is required.', 400);
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                verificationStatus: 'pending',
                verificationDocUrl: `/uploads/verifications/${req.file.filename}`
            },
            { new: true }
        );

        // Trigger alert to Admin
        try {
            const notificationService = require('../utils/notificationService');
            const admins = await User.find({ role: 'admin' }).select('_id');
            for (const admin of admins) {
                await notificationService.createNotification({
                    recipient: admin._id,
                    sender: req.user._id,
                    type: 'transfer',
                    title: 'New Verification Request 📑',
                    message: `${user.firstName} ${user.lastName || ''} (${user.role}) requested profile verification.`,
                    link: '/admin/dashboard'
                });
            }
        } catch (notifErr) {
            console.error('Failed to notify admins about verification request:', notifErr.message);
        }

        return sendSuccess(res, { user: user.toPublicJSON() }, 'Verification request submitted successfully.');
    } catch (err) {
        console.error('requestVerification error:', err);
        return sendError(res, 'Failed to request verification.', 500);
    }
};
