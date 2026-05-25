const Notification = require('../models/Notification');

// Map of userId string -> Set of active Express Response objects
const activeConnections = new Map();

/**
 * Register an active SSE response stream for a user
 * Supports multiple tabs by storing a Set of connections
 */
const addConnection = (userId, res) => {
  const userIdStr = userId.toString();
  if (!activeConnections.has(userIdStr)) {
    activeConnections.set(userIdStr, new Set());
  }
  activeConnections.get(userIdStr).add(res);
  console.log(`📡 SSE client registered: user=${userIdStr} (total=${activeConnections.get(userIdStr).size})`);
};

/**
 * Remove an active SSE response stream for a user
 */
const removeConnection = (userId, res) => {
  const userIdStr = userId.toString();
  if (activeConnections.has(userIdStr)) {
    const userConns = activeConnections.get(userIdStr);
    userConns.delete(res);
    console.log(`🔌 SSE client disconnected: user=${userIdStr} (remaining=${userConns.size})`);
    if (userConns.size === 0) {
      activeConnections.delete(userIdStr);
    }
  }
};

/**
 * Save notification to database and push to active streams in real-time
 */
const sendNotification = async ({ recipient, sender, type, title, message, link }) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
    });

    // Populate sender details for the UI (e.g. sender name, company)
    const populated = await Notification.findById(notification._id)
      .populate('sender', 'firstName lastName email companyName')
      .lean();

    const recipientStr = recipient.toString();
    const userConns = activeConnections.get(recipientStr);

    if (userConns && userConns.size > 0) {
      console.log(`🚀 Pushing notification in real-time to user=${recipientStr}`);
      const payload = JSON.stringify(populated);
      userConns.forEach((res) => {
        res.write(`data: ${payload}\n\n`);
      });
    }

    return populated;
  } catch (err) {
    console.error('Error in sendNotification:', err);
  }
};

module.exports = {
  addConnection,
  removeConnection,
  sendNotification,
};
