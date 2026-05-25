const express = require('express');
const router = express.Router();

const {
    applyForJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus,
    replyToApplication,
    getEmployers,
    transferApplication,
    getAssignedApplications,
    scheduleInterview,
    cancelInterview,
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/auth');

// ─── Jobseeker Routes ─────────────────────────────────────────────────────────

// POST /api/applications — Apply for a job
router.post('/', protect, authorize('jobseeker'), applyForJob);

// GET /api/applications/my — Get my applications
router.get('/my', protect, authorize('jobseeker'), getMyApplications);

// ─── Employer Routes ──────────────────────────────────────────────────────────

// GET /api/applications/employers — List active employers to transfer to
router.get('/employers', protect, authorize('employer'), getEmployers);

// GET /api/applications/assigned — Get applications assigned to me
router.get('/assigned', protect, authorize('employer'), getAssignedApplications);

// GET /api/applications/job/:jobId — View applicants for a job
router.get('/job/:jobId', protect, authorize('employer'), getJobApplications);

// PUT /api/applications/:id/transfer — Transfer application to another employer
router.put('/:id/transfer', protect, authorize('employer'), transferApplication);

// PUT /api/applications/:id/status — Update application status
router.put('/:id/status', protect, authorize('employer'), updateApplicationStatus);

// PUT /api/applications/:id/reply — Reply to application
router.put('/:id/reply', protect, authorize('employer', 'jobseeker'), replyToApplication);

// PUT /api/applications/:id/interview — Schedule interview
router.put('/:id/interview', protect, authorize('employer'), scheduleInterview);

// DELETE /api/applications/:id/interview — Cancel interview
router.delete('/:id/interview', protect, authorize('employer'), cancelInterview);

module.exports = router;
