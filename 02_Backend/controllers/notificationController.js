const Notification = require('../models/Notification');
const notificationService = require('../utils/notificationService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Get all notifications for logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'firstName lastName email companyName')
      .sort('-createdAt')
      .limit(50);

    return sendSuccess(res, { notifications });
  } catch (err) {
    console.error('getNotifications error:', err);
    return sendError(res, 'Failed to retrieve notifications.', 500);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    ).populate('sender', 'firstName lastName email companyName');

    if (!notification) {
      return sendError(res, 'Notification not found.', 404);
    }

    return sendSuccess(res, { notification }, 'Notification marked as read.');
  } catch (err) {
    console.error('markAsRead error:', err);
    return sendError(res, 'Failed to update notification.', 500);
  }
};

/**
 * @desc    Mark all user's notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    return sendSuccess(res, null, 'All notifications marked as read.');
  } catch (err) {
    console.error('markAllAsRead error:', err);
    return sendError(res, 'Failed to update notifications.', 500);
  }
};

/**
 * @desc    Establish real-time SSE stream for notifications
 * @route   GET /api/notifications/stream
 * @access  Private (authenticates via protect route, matching token in query string)
 */
exports.streamNotifications = async (req, res) => {
  try {
    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': process.env.CLIENT_URL || '*',
      'Access-Control-Allow-Credentials': 'true',
    });

    // Send connection established comment
    res.write(': ok\n\n');

    const userId = req.user._id;

    // Add client response object to notification connections
    notificationService.addConnection(userId, res);

    // Heartbeat to keep connection open in browsers/proxies
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 40000);

    // Cleanup connection on close
    req.on('close', () => {
      clearInterval(heartbeat);
      notificationService.removeConnection(userId, res);
      res.end();
    });
  } catch (err) {
    console.error('SSE Stream error:', err);
    res.status(500).end();
  }
};
