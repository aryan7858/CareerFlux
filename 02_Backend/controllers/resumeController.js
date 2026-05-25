const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const { sendSuccess, sendError } = require('../utils/response');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload a resume (PDF)
// @route   POST /api/resumes/upload
// @access  Private (Jobseeker)
// ─────────────────────────────────────────────────────────────────────────────
exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return sendError(res, 'Please upload a PDF file.', 400);
        }

        // Remove old resume if exists
        const oldResume = await Resume.findOne({ user: req.user._id });
        if (oldResume) {
            // Delete old file from disk
            const oldPath = path.resolve(oldResume.path);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
            await Resume.findByIdAndDelete(oldResume._id);
        }

        const resume = await Resume.create({
            user: req.user._id,
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            mimeType: req.file.mimetype,
            size: req.file.size,
        });

        return sendSuccess(res, { resume }, 'Resume uploaded successfully.', 201);
    } catch (err) {
        console.error('UploadResume error:', err);
        return sendError(res, 'Failed to upload resume.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get my resume
// @route   GET /api/resumes/my
// @access  Private (Jobseeker)
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({ user: req.user._id });

        if (!resume) {
            return sendError(res, 'No resume found. Please upload one.', 404);
        }

        return sendSuccess(res, { resume });
    } catch (err) {
        console.error('GetMyResume error:', err);
        return sendError(res, 'Failed to fetch resume.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Download a resume (secure — only owner or employer viewing applicant)
// @route   GET /api/resumes/download/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.downloadResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return sendError(res, 'Resume not found.', 404);
        }

        const filePath = path.resolve(resume.path);
        if (!fs.existsSync(filePath)) {
            return sendError(res, 'Resume file not found on server.', 404);
        }

        res.download(filePath, resume.originalName);
    } catch (err) {
        console.error('DownloadResume error:', err);
        return sendError(res, 'Failed to download resume.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete my resume
// @route   DELETE /api/resumes/my
// @access  Private (Jobseeker)
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({ user: req.user._id });

        if (!resume) {
            return sendError(res, 'No resume found to delete.', 404);
        }

        // Delete file from disk
        const filePath = path.resolve(resume.path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Resume.findByIdAndDelete(resume._id);

        return sendSuccess(res, {}, 'Resume deleted successfully.');
    } catch (err) {
        console.error('DeleteResume error:', err);
        return sendError(res, 'Failed to delete resume.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    View a resume inline (authenticated)
// @route   GET /api/resumes/view/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.viewResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return sendError(res, 'Resume not found.', 404);
        }

        const filePath = path.resolve(resume.path);
        if (!fs.existsSync(filePath)) {
            return sendError(res, 'Resume file not found on server.', 404);
        }

        res.contentType("application/pdf");
        res.sendFile(filePath);
    } catch (err) {
        console.error('ViewResume error:', err);
        return sendError(res, 'Failed to view resume.', 500);
    }
};
