import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from "../services/api";
import { authApi } from "../services/authApi";
import { userApi } from "../services/userApi";
import { postApi } from "../services/postApi";
import { friendApi } from "../services/friendApi";
import { messageApi } from "../services/messageApi";
import { notificationApi } from "../services/notificationApi";
import { searchApi } from "../services/searchApi";
import { commentApi } from "../services/commentApi";
import { likeApi } from "../services/likeApi";

/**
 * DEPRECATED: Use individual service files from src/services/ instead.
 * This file is kept for backward compatibility during refactoring.
 */

export {
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
  authApi,
  userApi,
  postApi,
  friendApi,
  messageApi,
  notificationApi,
  searchApi,
  commentApi,
  likeApi
};
