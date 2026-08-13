/**
 * Lightweight "online" presence approximation — there is no real-time
 * infrastructure (websockets/heartbeat) in this app, so "online" is derived
 * from how recently the user last logged in, honoring their own
 * user_settings.online_status toggle (if they've turned it off, they never
 * show as online here regardless of recency).
 */
const ONLINE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function isOnline(lastLogin, onlineStatusEnabled) {
  if (!onlineStatusEnabled || !lastLogin) return false;
  return Date.now() - new Date(lastLogin).getTime() < ONLINE_WINDOW_MS;
}

module.exports = { isOnline };
