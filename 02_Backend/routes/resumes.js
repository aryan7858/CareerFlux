const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');

const {
    uploadResume,
    getMyResume,
    downloadResume,
    deleteResume,
    viewResume,
} = require('../controllers/resumeController');

const { protect, authorize } = require('../middleware/auth');

// ─── Jobseeker Routes ─────────────────────────────────────────────────────────

// POST /api/resumes/upload — Upload PDF resume
router.post('/upload', protect, authorize('jobseeker'), upload.single('resume'), uploadResume);

// GET /api/resumes/my — Get own resume info
router.get('/my', protect, authorize('jobseeker'), getMyResume);

// DELETE /api/resumes/my — Delete own resume
router.delete('/my', protect, authorize('jobseeker'), deleteResume);

// ─── Shared Route ─────────────────────────────────────────────────────────────

// GET /api/resumes/download/:id — Download a resume (authenticated)
router.get('/download/:id', protect, downloadResume);

// GET /api/resumes/view/:id — View a resume inline (authenticated)
router.get('/view/:id', protect, viewResume);

module.exports = router;
