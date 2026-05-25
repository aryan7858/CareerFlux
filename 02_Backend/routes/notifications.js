const express = require('express');
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  streamNotifications,
} = require('../controllers/notificationController');

const { protect } = require('../middleware/auth');

// ─── Real-Time Stream ──────────────────────────────────────────────────────────
// GET /api/notifications/stream — SSE endpoint for real-time delivery
router.get('/stream', protect, streamNotifications);

// ─── CRUD Routes ──────────────────────────────────────────────────────────────
// GET /api/notifications — Retrieve latest notifications
router.get('/', protect, getNotifications);

// PUT /api/notifications/read-all — Mark all notifications as read
router.put('/read-all', protect, markAllAsRead);

// PUT /api/notifications/:id/read — Mark single notification as read
router.put('/:id/read', protect, markAsRead);

module.exports = router;
