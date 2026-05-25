
const express = require('express');
const router = express.Router();

const {
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getAllJobs,
    adminDeleteJob,
    createEmployer,
    adminUpdateJobStatus,
    getAllApplications,
    adminDeleteApplication,
    getPendingVerifications,
    reviewVerification,
    downloadVerificationDoc,
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// GET /api/admin/stats — Platform statistics
router.get('/stats', getDashboardStats);

// GET /api/admin/users — All users (paginated)
router.get('/users', getAllUsers);

// PUT /api/admin/users/:id/status — Activate/deactivate user
router.put('/users/:id/status', updateUserStatus);

// DELETE /api/admin/users/:id — Delete user
router.delete('/users/:id', deleteUser);

// POST /api/admin/users/employer — Create pre-approved employer
router.post('/users/employer', createEmployer);

// GET /api/admin/jobs — All jobs (admin view)
router.get('/jobs', getAllJobs);

// DELETE /api/admin/jobs/:id — Delete any job
router.delete('/jobs/:id', adminDeleteJob);

// PUT /api/admin/jobs/:id/status — Activate/deactivate any job
router.put('/jobs/:id/status', adminUpdateJobStatus);

// GET /api/admin/applications — Get all applications
router.get('/applications', getAllApplications);

// DELETE /api/admin/applications/:id — Delete any application
router.delete('/applications/:id', adminDeleteApplication);

// Verification management routes
router.get('/verifications', getPendingVerifications);
router.put('/verifications/:userId', reviewVerification);
router.get('/verifications/download/:userId', downloadVerificationDoc);

module.exports = router;
