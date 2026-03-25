// ============================================================================
// Authentication Types
// ============================================================================

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  phone?: string;
  role?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  name?: string;
  avatarUrl?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  hobby?: string;
  address?: string;
  status?: string;
  displayFriendsStatus?: string;
  authProvider?: string;
  createdAt?: string;
  roles?: string[];
  isOnline?: boolean;
  followers?: number;
  following?: number;
  mutualFriends?: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export enum Privacy {
  PUBLIC = "PUBLIC",
  FRIEND_ONLY = "FRIEND_ONLY",
  ONLY_ME = "ONLY_ME",
}

export interface PostImageDto {
  id: number;
  imageUrl: string;
  orderIndex: number;
}

export interface Post {
  id: string;
  userId: string;
  author: User;
  content: string;
  privacy: Privacy;
  feeling?: string;
  images: PostImageDto[];
  likes: number;
  isLiked: boolean;
  commentCount: number;
  comments: Comment[];
  createdAt: string;
  updatedAt?: string;
  aiSummary?: string;
}

export interface PostCreateRequest {
  content?: string;
  privacy: Privacy;
  feeling?: string;
  images?: File[];
}

export interface PostUpdateRequest {
  content?: string;
  privacy: Privacy;
  feeling?: string;
  deletedImageIds?: number[];
  newImages?: File[];
}

export enum NotificationType {
  LIKE_POST = "LIKE_POST",
  LIKE_COMMENT = "LIKE_COMMENT",
  COMMENT_POST = "COMMENT_POST",
  REPLY_COMMENT = "REPLY_COMMENT",
  FRIEND_REQUEST = "FRIEND_REQUEST",
  FRIEND_ACCEPT = "FRIEND_ACCEPT",
}

export interface Notification {
  id: string | number;
  actor: User;
  type: NotificationType;
  referenceId?: string | number;
  isRead: boolean;
  createdAt: string;
}

export type FriendshipStatus =
  | "NONE"
  | "PENDING_SENT"
  | "PENDING_RECEIVED"
  | "ACCEPTED"
  | "LOADING";

export interface FriendStatusDTO {
  status: FriendshipStatus | string;
  friendshipId?: number;
  requesterId?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken?: string | null;
}
