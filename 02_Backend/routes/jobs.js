const express = require('express');
const router = express.Router();

const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getEmployerJobs,
} = require('../controllers/jobController');

const { protect, authorize } = require('../middleware/auth');

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /api/jobs — Browse all active jobs with search/filter
router.get('/', getJobs);

// GET /api/jobs/:id — View single job
router.get('/:id', getJobById);

// ─── Employer Routes ──────────────────────────────────────────────────────────

// GET /api/jobs/employer/my-jobs — Employer's own jobs
router.get('/employer/my-jobs', protect, authorize('employer'), getEmployerJobs);

// POST /api/jobs — Create a new job posting
router.post('/', protect, authorize('employer'), createJob);

// PUT /api/jobs/:id — Update own job
router.put('/:id', protect, authorize('employer'), updateJob);

// DELETE /api/jobs/:id — Delete own job
router.delete('/:id', protect, authorize('employer'), deleteJob);

module.exports = router;
