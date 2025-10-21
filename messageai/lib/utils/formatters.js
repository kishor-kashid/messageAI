/**
 * Formatting Utilities for MessageAI MVP
 * 
 * Date/time formatting, text formatting, etc.
 */

/**
 * Format timestamp to user-friendly string
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date string (e.g., "Today", "Yesterday", "Jan 15")
 */
export function formatTimestamp(timestamp) {
  if (!timestamp || isNaN(timestamp)) {
    return '';
  }

  const date = new Date(timestamp);
  const now = new Date();
  
  // Reset time to midnight for accurate day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = today - compareDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Today
  if (diffDays === 0) {
    return formatTime(timestamp);
  }
  
  // Yesterday
  if (diffDays === 1) {
    return 'Yesterday';
  }
  
  // Within last week
  if (diffDays < 7) {
    return formatDayOfWeek(timestamp);
  }
  
  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    return formatMonthDay(timestamp);
  }
  
  // Different year
  return formatFullDate(timestamp);
}

/**
 * Format timestamp to time only (e.g., "2:30 PM")
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted time string
 */
export function formatTime(timestamp) {
  if (!timestamp || isNaN(timestamp)) {
    return '';
  }

  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${hours}:${minutesStr} ${ampm}`;
}

/**
 * Format timestamp to day of week (e.g., "Monday")
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Day of week
 */
export function formatDayOfWeek(timestamp) {
  if (!timestamp || isNaN(timestamp)) {
    return '';
  }

  const date = new Date(timestamp);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Format timestamp to month and day (e.g., "Jan 15")
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Month and day
 */
export function formatMonthDay(timestamp) {
  if (!timestamp || isNaN(timestamp)) {
    return '';
  }

  const date = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Format timestamp to full date (e.g., "Jan 15, 2025")
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Full date string
 */
export function formatFullDate(timestamp) {
  if (!timestamp || isNaN(timestamp)) {
    return '';
  }

  const date = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Format timestamp to relative time (e.g., "2 mins ago", "1 hour ago")
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Relative time string
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp || isNaN(timestamp)) {
    return '';
  }

  const now = Date.now();
  const diffMs = now - timestamp;
  
  // Handle future timestamps
  if (diffMs < 0) {
    return 'just now';
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 10) {
    return 'just now';
  }
  
  if (seconds < 60) {
    return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
  }
  
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  }
  
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  if (weeks < 4) {
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
  
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
  
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

/**
 * Format message preview (truncate long messages)
 * @param {string} text - Message text
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export function formatMessagePreview(text, maxLength = 50) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const trimmed = text.trim();
  
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  
  return trimmed.substring(0, maxLength) + '...';
}

/**
 * Format file size (bytes to human-readable)
 * @param {number} bytes - Size in bytes
 * @returns {string} Human-readable size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes) || bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + units[i];
}

/**
 * Format phone number (basic US format)
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // US format: (123) 456-7890
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  // International format with country code
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
  }
  
  // Return as-is if not standard format
  return phone;
}

/**
 * Format participant count for group chats
 * @param {number} count - Number of participants
 * @returns {string} Formatted count (e.g., "3 participants")
 */
export function formatParticipantCount(count) {
  if (!count || isNaN(count)) {
    return '0 participants';
  }
  
  return `${count} participant${count !== 1 ? 's' : ''}`;
}

/**
 * Format display name with fallback
 * @param {string} displayName - Display name
 * @param {string} email - Email (fallback)
 * @returns {string} Display name or email
 */
export function formatDisplayName(displayName, email) {
  if (displayName && displayName.trim()) {
    return displayName.trim();
  }
  
  if (email) {
    // Return email username (before @)
    const username = email.split('@')[0];
    return username;
  }
  
  return 'Unknown User';
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalizeFirst(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format list of names with commas and "and"
 * @param {string[]} names - Array of names
 * @returns {string} Formatted list (e.g., "Alice, Bob, and Charlie")
 */
export function formatNameList(names) {
  if (!names || !Array.isArray(names) || names.length === 0) {
    return '';
  }
  
  if (names.length === 1) {
    return names[0];
  }
  
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  
  const allButLast = names.slice(0, -1).join(', ');
  const last = names[names.length - 1];
  
  return `${allButLast}, and ${last}`;
}

