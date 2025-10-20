/**
 * App-wide constants for MessageAI MVP
 */

// Message statuses
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
};

// Conversation types
export const CONVERSATION_TYPE = {
  DIRECT: 'direct',
  GROUP: 'group',
};

// Database name
export const DB_NAME = 'messageai.db';

// Pagination
export const MESSAGES_PER_PAGE = 50;
export const CONVERSATIONS_PER_PAGE = 20;

// Network timeouts (milliseconds)
export const NETWORK_TIMEOUT = 10000; // 10 seconds
export const RETRY_DELAY = 2000; // 2 seconds

// Queue limits
export const MAX_QUEUE_SIZE = 1000;

// Performance targets
export const MESSAGE_DELIVERY_TARGET_MS = 2000; // 2 seconds
export const PRESENCE_UPDATE_TARGET_MS = 5000; // 5 seconds

