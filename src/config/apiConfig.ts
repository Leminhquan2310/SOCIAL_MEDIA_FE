/**
 * API Configuration
 * Centralized API settings for the entire application
 */

export const API_CONFIG = {
  // Base API URL - read from environment or use default
  BASE_URL_ORIGIN: import.meta.env.VITE_API_BASE_URL_ORIGIN || "https://localhost:8080",
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://localhost:8080/api",
  WS_URL: import.meta.env.VITE_WS_URL || "https://localhost:8080/ws-notifications",

  // Timeout duration in milliseconds
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000"),

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
      GET_BY_USERNAME: (username: string) => `/users/username/${username}`,
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
      SHARE: (id: string) => `/posts/${id}/share`,
    },

    // Comment endpoints
    COMMENT: {
      BY_POST: (postId: string) => `/posts/${postId}/comments`,
      UPDATE: (commentId: string) => `/comments/${commentId}`,
      DELETE: (commentId: string) => `/comments/${commentId}`,
      REPLIES: (commentId: string) => `/comments/${commentId}/replies`,
    },

    // Like endpoints
    LIKE: {
      TOGGLE: "/likes/toggle",
      STATUS: "/likes/status",
      COUNT: "/likes/count",
    },

    // Friends endpoints
    FRIEND: {
      LIST: (username: string) => `/friends/${username}`,
      SUGGESTIONS: "/friends/suggestions",
      REQUESTS: "/friends/requests",
      SEND_REQUEST: (id: string) => `/friends/request/${id}`,
      CANCEL_REQUEST: (id: string) => `/friends/request/${id}`,
      ACCEPT_REQUEST: (id: string) => `/friends/accept/${id}`,
      DECLINE_REQUEST: (id: string) => `/friends/decline/${id}`,
      REMOVE_FRIEND: (id: string) => `/friends/${id}`,
      GET_STATUS: (id: string) => `/friends/status/${id}`,
      MUTUAL_FRIENDS: (id: string) => `/friends/mutual/${id}`,
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
      MARK_READ: (id: string) => `/notifications/${id}/read`,
      MARK_ALL_READ: "/notifications/read-all",
      UNREAD_COUNT: "/notifications/unread-count",
      DELETE: (id: string) => `/notifications/${id}`,
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
