/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

/**
 * Get today's date string
 */
export const getTodayDate = () => formatDate();

/**
 * Parse prayer time string (HH:MM (XXX))
 */
export const parsePrayerTime = (timeString) => {
  return timeString?.split(' ')[0] || 'N/A';
};

/**
 * Check if notification permissions are granted
 */
export const checkNotificationPermission = () => {
  if ('Notification' in window) {
    return Notification.permission === 'granted';
  }
  return false;
};

/**
 * Request notification permissions
 */
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return checkNotificationPermission();
};

/**
 * Show browser notification
 */
export const showNotification = (title, options = {}) => {
  if (checkNotificationPermission()) {
    return new Notification(title, {
      icon: '/prayer-icon.png',
      ...options,
    });
  }
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};