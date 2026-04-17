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
  id: number;
  postId: number;
  authorId: number;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  createdAt: string;
  updatedAt?: string;
  parentCommentId?: number | null;
  parentCommentName?: string | null;
  parentCommentUsername?: string | null;
  likeCount: number;
  liked: boolean;
  replyCount: number;
  edited?: boolean;
  mediaStatus?: MediaStatus;
}

export enum Privacy {
  PUBLIC = "PUBLIC",
  FRIEND_ONLY = "FRIEND_ONLY",
  ONLY_ME = "ONLY_ME",
  HIDDEN = "HIDDEN",
}

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export enum MediaStatus {
  ACTIVE = "ACTIVE",
  FLAGGED = "FLAGGED",
  REJECTED = "REJECTED",
  DELETED = "DELETED",
}

export interface AdminMedia {
  id: number;
  url: string;
  type: MediaType;
  status: MediaStatus;
  violationScore: number;
  sourceType: "POST" | "COMMENT";
  sourceId: number;
  ownerName: string;
  createdAt: string;
  content: string;
}

export interface PostImageDto {
  id: number;
  mediaUrl: string;
  mediaType: MediaType;
  orderIndex: number;
  status?: MediaStatus;
}

export interface Post {
  id: string;
  userId: string;
  author: User;
  content: string;
  privacy: Privacy;
  feeling?: string;
  images: PostImageDto[];
  likeCount: number;
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
  videos?: File[];
}

export interface PostUpdateRequest {
  content?: string;
  privacy: Privacy;
  feeling?: string;
  deletedImageIds?: number[];
  newImages?: File[];
  newVideos?: File[];
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
  actorCount?: number;
  type: NotificationType;
  referenceId?: string | number;
  targetId?: string | number;
  ancestorIds?: string;
  isRead: boolean;
  isActionable?: boolean;
  isSilent?: boolean;
  createdAt: string;
  updatedAt?: string;
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

export interface FriendUserDTO {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  mutualFriendsCount: number;
  exactMatch?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken?: string | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface VisitStatDto {
  date: string;
  visitCount: number;
}

export interface AdminUserResponseDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  address: string;
  phone: string;
  avatarUrl: string;
  dateOfBirth: string;
  gender: string;
  hobby: string;
  status: string;
  displayFriendsStatus: string;
  authProvider: string;
  createdAt: string;
  enabled: boolean;
  roles: string[];
}

export interface NewUserStatDto {
  date: string;
  newUserCount: number;
}

export interface AdminReportStatsDto {
  totalReportCount: number;
  totalReportedPosts: number;
}

export interface SuspectIpDto {
  ip: string;
  accountCount: number;
  blocked: boolean;
  accounts: AdminUserResponseDto[];
}

export interface AdminPostResponseDto {
  postId: number;
  userId: number;
  username: string;
  content: string;
  status: Privacy;
  reportCount: number;
  createdAt: string;
}

// ============================================================================
// Chat Types
// ============================================================================

export interface MessageDto {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  status: string;
  createdAt: string;
  seenAt?: string;
}

export enum ConversationType {
  PRIVATE = "PRIVATE",
  GROUP = "GROUP"
}

export interface ConversationResponseDto {
  id: number;
  type?: ConversationType;
  otherUserId: number | null;
  otherUserFullName: string;
  otherUserUsername: string;
  otherUserAvatar?: string;
  lastMessage: string;
  lastSenderId: number;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatRequest {
  senderId: number;
  receiverId: number;
  content: string;
}

export interface MessageStatus {
  SENT: "SENT";
  DELIVERED: "DELIVERED";
  SEEN: "SEEN";
}
