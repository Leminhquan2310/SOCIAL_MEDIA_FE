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

export interface Post {
  id: string;
  userId: string;
  author: User;
  content: string;
  image?: string;
  likes: number;
  isLiked: boolean;
  commentCount: number;
  comments: Comment[];
  createdAt: string;
  aiSummary?: string;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "friend_request";
  fromUser: User;
  read: boolean;
  createdAt: string;
  postId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken?: string | null;
}
