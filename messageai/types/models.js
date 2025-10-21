/**
 * @fileoverview JSDoc type definitions for MessageAI data models
 * These types serve as documentation and can be used for IDE autocomplete
 */

/**
 * @typedef {Object} User
 * @property {string} id - User unique identifier
 * @property {string} email - User email address
 * @property {string} displayName - User display name
 * @property {string} profilePicture - URL to profile picture
 * @property {boolean} isOnline - Whether user is currently online
 * @property {number} lastSeen - Timestamp of last activity
 * @property {string} [pushToken] - Push notification token
 * @property {number} createdAt - Account creation timestamp
 */

/**
 * @typedef {Object} Message
 * @property {string} id - Message unique identifier
 * @property {string} conversationId - ID of the conversation this message belongs to
 * @property {string} senderId - ID of the user who sent the message
 * @property {string} [content] - Message text content (optional if image is present)
 * @property {string} [text] - Alias for content (for backward compatibility)
 * @property {string} [imageUrl] - URL to attached image (from Firebase Storage)
 * @property {number} timestamp - Message creation timestamp
 * @property {'sending'|'sent'|'delivered'|'read'|'queued'|'failed'} status - Message delivery status
 * @property {string[]} [readBy] - Array of user IDs who have read this message (for group chats)
 * @property {boolean} synced - Whether message has been synced to server
 */

/**
 * @typedef {Object} Conversation
 * @property {string} id - Conversation unique identifier
 * @property {'direct'|'group'} type - Type of conversation
 * @property {string[]} participants - Array of user IDs in this conversation
 * @property {string} [lastMessage] - Text of the last message
 * @property {number} [lastMessageTime] - Timestamp of last message
 * @property {string} [groupName] - Name of group (for group conversations)
 * @property {number} createdAt - Conversation creation timestamp
 */

/**
 * @typedef {Object} Contact
 * @property {string} userId - Contact's user ID
 * @property {string} displayName - Contact's display name
 * @property {string} [email] - Contact's email
 * @property {string} [profilePicture] - URL to contact's profile picture
 * @property {number} addedAt - Timestamp when contact was added
 */

/**
 * @typedef {Object} Presence
 * @property {string} userId - User ID
 * @property {boolean} isOnline - Whether user is online
 * @property {number} lastSeen - Last seen timestamp
 * @property {number} updatedAt - Last presence update timestamp
 */

/**
 * @typedef {Object} QueuedMessage
 * @property {string} id - Message ID
 * @property {'message'} type - Type of queued item
 * @property {Message} data - The message data
 * @property {number} attempts - Number of sync attempts
 * @property {number} timestamp - When it was added to queue
 */

// Export empty object to make this a module
export {};

