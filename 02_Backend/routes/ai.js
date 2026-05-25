const express = require('express');
const router = express.Router();

const {
  getSmartRecommendations,
  screenApplicants,
  getMatchDetails,
} = require('../controllers/aiController');

const { protect, authorize } = require('../middleware/auth');

// ─── Seeker Recommendations ──────────────────────────────────────────────────
// GET /api/ai/recommendations — Fetch smart recommended jobs for job seeker
router.get('/recommendations', protect, authorize('jobseeker'), getSmartRecommendations);

// ─── Employer Screening & Ranking ────────────────────────────────────────────
// GET /api/ai/screen-applicants/:jobId — Screen and rank all job applications
router.get('/screen-applicants/:jobId', protect, authorize('employer', 'admin'), screenApplicants);

// ─── Common Matching Details ─────────────────────────────────────────────────
// GET /api/ai/match-details/:applicationId — Get matching analysis report
router.get('/match-details/:applicationId', protect, getMatchDetails);

module.exports = router;
