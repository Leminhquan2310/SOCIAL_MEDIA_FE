# API Configuration Guide - NexusSocial

Hướng dẫn toàn diện cho cấu hình API trong dự án NexusSocial.

## 📋 Mục lục

1. [Cấu trúc tệp](#cấu-trúc-tệp)
2. [Biến môi trường](#biến-môi-trường)
3. [Cách sử dụng API](#cách-sử-dụng-api)
4. [Hooks tùy chỉnh](#hooks-tùy-chỉnh)
5. [Xử lý lỗi](#xử-lý-lỗi)
6. [Ví dụ thực tế](#ví-dụ-thực-tế)

---

## 🗂️ Cấu trúc tệp

```
project/
├── config/
│   └── apiConfig.ts          # Cấu hình API tập trung
├── services/
│   └── api.ts                # Instance Axios + Interceptors
├── hooks/
│   └── useApi.ts             # Custom hooks cho API
├── utils/
│   └── apiClient.ts          # Helper functions cho API
├── .env.local                # Biến môi trường (local)
├── .env.example              # Template biến môi trường
└── vite.config.ts            # Cấu hình Vite
```

---

## 🔐 Biến môi trường

### Tạo file `.env.local`

Copy từ `.env.example` và điền thông tin:

```bash
# API Configuration
VITE_API_BASE_URL=https://api.nexus-social.mock/v1
VITE_API_TIMEOUT=10000
VITE_API_MAX_RETRIES=3
VITE_API_RETRY_DELAY=1000

# Gemini AI
VITE_GEMINI_API_KEY=your_api_key_here
VITE_GEMINI_MODEL=gemini-2.0-flash
VITE_GEMINI_MAX_TOKENS=1000

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_CACHING=true
VITE_ENABLE_ANALYTICS=true

# Cache
VITE_CACHE_TTL=300000
VITE_CACHE_MAX_SIZE=100
```

### Truy cập biến môi trường trong code

```typescript
import { API_CONFIG, GEMINI_CONFIG } from '@/config/apiConfig';

console.log(API_CONFIG.BASE_URL);           // https://api.nexus-social.mock/v1
console.log(API_CONFIG.TIMEOUT);            // 10000
console.log(GEMINI_CONFIG.API_KEY);         // your_api_key_here
console.log(API_CONFIG.FEATURES.ENABLE_AI_FEATURES); // true
```

---

## 🔗 Cách sử dụng API

### 1. Sử dụng Helper Functions (Đơn giản nhất)

```typescript
import { postApi, userApi, friendApi } from '@/utils/apiClient';

// GET - Lấy danh sách bài đăng
const posts = await postApi.getPosts();

// GET - Lấy thông tin người dùng
const user = await userApi.getProfile();

// POST - Tạo bài đăng mới
const newPost = await postApi.createPost({
  content: 'Hello NexusSocial!',
  image: 'image.jpg'
});

// PATCH - Cập nhật bài đăng
await postApi.updatePost(postId, { content: 'Updated!' });

// DELETE - Xóa bài đăng
await postApi.deletePost(postId);

// POST - Theo dõi người dùng
await userApi.follow(userId);

// GET - Lấy đề xuất bạn bè
const suggestions = await friendApi.getSuggestions();
```

### 2. Sử dụng Custom Hooks (Tích hợp vào Component)

```typescript
import { useApi, useFetch, usePost, useUpdate, useDelete } from '@/hooks/useApi';
import { API_CONFIG } from '@/config/apiConfig';

// GET - Lấy dữ liệu tự động
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error } = useFetch(
    `/users/${userId}`,
    { onError: (err) => console.error(err) }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{user?.name}</div>;
}

// POST - Tạo bài đăng
function CreatePostForm() {
  const { post, loading, error } = usePost<Post>();

  const handleSubmit = async (formData: PostData) => {
    try {
      const newPost = await post(API_CONFIG.ENDPOINTS.POST.CREATE, formData);
      console.log('Post created:', newPost);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({ content: 'Test' });
    }}>
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Create Post'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

// PATCH - Cập nhật thông tin
function EditProfile() {
  const { update, loading, error } = useUpdate<User>();

  const handleUpdate = async (profileData: Partial<User>) => {
    try {
      await update(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE, profileData);
      console.log('Profile updated');
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <button onClick={() => handleUpdate({ name: 'New Name' })} disabled={loading}>
      {loading ? 'Saving...' : 'Save Changes'}
    </button>
  );
}

// DELETE - Xóa tài nguyên
function DeletePostButton({ postId }: { postId: string }) {
  const { remove, loading } = useDelete();

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      try {
        await remove(API_CONFIG.ENDPOINTS.POST.DELETE(postId));
        console.log('Post deleted');
      } catch (err) {
        console.error('Failed to delete post:', err);
      }
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

### 3. Sử dụng API Instance trực tiếp

```typescript
import api from '@/services/api';
import { API_CONFIG } from '@/config/apiConfig';

// GET request
const response = await api.get('/users/profile');

// POST request
const response = await api.post(API_CONFIG.ENDPOINTS.POST.CREATE, {
  content: 'Hello!',
});

// With custom headers
const response = await api.get('/protected-resource', {
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

---

## 🎣 Hooks tùy chỉnh

### `useApi<T>()`

Hook chung cho tất cả các loại request.

```typescript
const { data, loading, error, request, setData, reset } = useApi<Post>();

// Manual request
await request('/posts/123', { method: 'GET' });

// Update data manually
setData({ id: 1, content: 'Updated' });

// Reset state
reset();
```

### `useFetch<T>(url, options?)`

Hook cho GET requests tự động.

```typescript
const { data: posts, loading, error } = useFetch<Post[]>('/posts');
const { data: user } = useFetch<User>(`/users/${userId}`);

// Conditional fetch (null URL = no request)
const { data: post } = useFetch<Post>(postId ? `/posts/${postId}` : null);
```

### `usePost<T>(url?, options?)`

Hook cho POST requests.

```typescript
const { post, loading, error } = usePost<Post>();

// Use with different URLs
const newPost = await post('/posts', { content: 'Test' });

// With default URL
const { post: createComment } = usePost('/comments');
await createComment('/posts/123/comments', { text: 'Nice post!' });
```

### `useUpdate<T>(url?, options?)`

Hook cho PATCH/PUT requests.

```typescript
const { update, loading } = useUpdate<User>();

// PATCH (default)
await update('/users/profile', { name: 'New Name' });

// PUT
await update('/users/profile', { name: 'New Name' }, 'PUT');
```

### `useDelete<T>(url?, options?)`

Hook cho DELETE requests.

```typescript
const { remove, loading } = useDelete();

await remove('/posts/123');
await remove(`/users/${userId}/friends/${friendId}`);
```

---

## ⚠️ Xử lý lỗi

### Tự động xử lý lỗi

```typescript
import { handleApiError } from '@/services/api';

try {
  await postApi.createPost(data);
} catch (error) {
  const message = handleApiError(error);
  console.error(message);
  // "Invalid request. Please check your input." (400)
  // "Unauthorized. Please log in again." (401)
  // "An unexpected error occurred." (unknown)
}
```

### Xử lý lỗi trong hooks

```typescript
const { data, error } = useFetch('/posts', {
  onError: (errorMessage) => {
    // Custom error handling
    showNotification(errorMessage, 'error');
  },
});

// Hoặc
if (error) {
  return <div className="alert alert-error">{error}</div>;
}
```

### Custom error handling

```typescript
try {
  await api.post('/posts', data);
} catch (error) {
  if (error.response?.status === 404) {
    console.log('Resource not found');
  } else if (error.response?.status === 429) {
    console.log('Too many requests, please wait');
  } else if (!error.response) {
    console.log('Network error');
  }
}
```

---

## 📝 Ví dụ thực tế

### 1. Component hiển thị danh sách bài đăng

```typescript
import React from 'react';
import { useFetch } from '@/hooks/useApi';
import { postApi } from '@/utils/apiClient';

function PostsFeed() {
  const { data: posts, loading, error } = useFetch('/posts');

  const handleLike = async (postId: string) => {
    try {
      await postApi.likePost(postId);
      // Refresh posts list
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="posts-feed">
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} onLike={handleLike} />
      ))}
    </div>
  );
}

export default PostsFeed;
```

### 2. Form đăng nhập

```typescript
import React, { useState } from 'react';
import { authApi } from '@/utils/apiClient';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authApi.login({ email, password });
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('refresh_token', result.refresh_token);
      navigate('/dashboard');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}

export default LoginForm;
```

### 3. Gọi API với token

Axios interceptor tự động thêm token:

```typescript
// Token được thêm tự động từ localStorage
const response = await api.get('/users/profile');
// Header: Authorization: Bearer <token>

// Hoặc
const user = await userApi.getProfile();
```

---

## 🚀 Best Practices

1. **Luôn sử dụng các helper functions** từ `apiClient.ts` thay vì gọi trực tiếp `api.request()`
2. **Sử dụng hooks** trong components để tự động quản lý loading state
3. **Xử lý lỗi đầy đủ** với `handleApiError()` hoặc callback `onError`
4. **Không commit `.env.local`** - chỉ commit `.env.example`
5. **Sử dụng TypeScript types** để đảm bảo type safety
6. **Tận dụng API_CONFIG** để tránh hardcode URLs

---

## 📚 Tài liệu tham khảo

- [Axios Documentation](https://axios-http.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [React Hooks](https://react.dev/reference/react)

---

**Tổi ưu hóa ngày: 2024**
