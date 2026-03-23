/**
 * API Configuration
 * Centralized API settings for the entire application
 */

export const API_CONFIG = {
  // Base API URL - read from environment or use default
  BASE_URL_ORIGIN: import.meta.env.VITE_API_BASE_URL_ORIGIN || "https://api.nexus-social.mock/v1",
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://api.nexus-social.mock/v1",

  // Timeout duration in milliseconds
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000"),

  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      REFRESH: "/auth/refresh-token",
      REGISTER: "/auth/register",
    },

    // User endpoints
    USER: {
      PROFILE: "/auth/me",
      GET_USER: (id: string) => `/users/${id}`,
      UPDATE_PROFILE: "/users/profile/update",
      UPDATE_AVATAR: "/users/profile/avatar",
      GET_FOLLOWERS: (id: string) => `/users/${id}/followers`,
      GET_FOLLOWING: (id: string) => `/users/${id}/following`,
      FOLLOW: (id: string) => `/users/${id}/follow`,
      UNFOLLOW: (id: string) => `/users/${id}/unfollow`,
    },

    // POST endpoints (formerly STATUS)
    POST: {
      LIST: "/posts",
      GET: (id: string) => `/posts/${id}`,
      CREATE: "/posts",
      UPDATE: (id: string) => `/posts/${id}`,
      DELETE: (id: string) => `/posts/${id}`,
      GET_ME: "/posts/me",
      GET_FEED: "/posts/feed",
      GET_USER_POSTS: (userId: string) => `/posts/user/${userId}`,
      SEARCH: "/posts/search",
      LIKE: (id: string) => `/posts/${id}/like`,
      UNLIKE: (id: string) => `/posts/${id}/unlike`,
      GET_LIKES: (id: string) => `/posts/${id}/likes`,
      COMMENT: (id: string) => `/posts/${id}/comments`,
      SHARE: (id: string) => `/posts/${id}/share`,
    },

    // Comment endpoints
    COMMENT: {
      CREATE: "/comments",
      UPDATE: (id: string) => `/comments/${id}`,
      DELETE: (id: string) => `/comments/${id}`,
      LIKE: (id: string) => `/comments/${id}/like`,
      UNLIKE: (id: string) => `/comments/${id}/unlike`,
    },

    // Friends endpoints
    FRIEND: {
      LIST: "/friends",
      SUGGESTIONS: "/friends/suggestions",
      REQUESTS: "/friends/requests",
      SEND_REQUEST: (id: string) => `/friends/request/${id}`,
      ACCEPT_REQUEST: (id: string) => `/friends/accept/${id}`,
      DECLINE_REQUEST: (id: string) => `/friends/decline/${id}`,
      REMOVE_FRIEND: (id: string) => `/friends/${id}`,
    },

    // Message endpoints
    MESSAGE: {
      LIST: "/messages",
      GET_CONVERSATION: (id: string) => `/messages/conversation/${id}`,
      SEND: "/messages/send",
      DELETE: (id: string) => `/messages/${id}`,
      MARK_READ: "/messages/mark-read",
    },

    // Notification endpoints
    NOTIFICATION: {
      LIST: "/notifications",
      MARK_READ: "/notifications/mark-read",
      DELETE: (id: string) => `/notifications/${id}`,
      SETTINGS: "/notifications/settings",
    },

    // Search endpoints
    SEARCH: {
      USERS: "/search/users",
      POSTS: "/search/posts",
      HASHTAGS: "/search/hashtags",
    },
  },

  // HTTP Headers
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Retry configuration
  RETRY: {
    MAX_RETRIES: parseInt(import.meta.env.VITE_API_MAX_RETRIES || "3"),
    RETRY_DELAY: parseInt(import.meta.env.VITE_API_RETRY_DELAY || "1000"), // milliseconds
    RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504], // Status codes to retry on
  },

  // Token configuration
  TOKEN: {
    TOKEN_PREFIX: "Bearer",
    WITH_CREDENTIALS: true,
  },

  // Environment
  ENVIRONMENT: import.meta.env.MODE as "development" | "production",
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};
