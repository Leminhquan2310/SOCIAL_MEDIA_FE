# Authentication System Documentation

## Overview

This document describes the complete authentication system implementation for NexusSocial, including registration, login, and token refresh functionality.

## Architecture

### Components

- **AuthContext** (`contexts/AuthContext.tsx`) - Central authentication state management
- **LoginPage** (`pages/LoginPage.tsx`) - User login interface
- **RegisterPage** (`pages/RegisterPage.tsx`) - User registration interface
- **API Services** (`services/api.ts`, `utils/apiClient.ts`) - HTTP request handling with token management
- **Types** (`types.ts`) - TypeScript interfaces for authentication

### Flow Diagram

```
User Input → Form Validation → API Call → Token Storage → State Update → Navigation
```

## API Endpoints

### Registration

**Endpoint:** `POST /auth/register`

**Request:**

```json
{
  "fullName": "Nguyễn Văn Ti",
  "username": "nguyenvanti2",
  "email": "nguyenvanti2@gmail.com",
  "password": "123456",
  "confirmPassword": "123456",
  "dateOfBirth": "",
  "phone": "",
  "role": ""
}
```

**Response (201 Created):**

```json
{
  "code": 201,
  "message": "CREATED",
  "data": {
    "id": 3,
    "username": "nguyenvanti2",
    "email": "nguyenvanti2@gmail.com",
    "fullName": "Nguyễn Văn Ti",
    "message": "User registered successfully"
  }
}
```

### Login

**Endpoint:** `POST /auth/login`

**Request:**

```json
{
  "username": "nguyenvanti2",
  "password": "123456"
}
```

**Response (200 SUCCESS):**

```json
{
  "code": 200,
  "message": "SUCCESS",
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 899674
  }
}
```

### Refresh Token

**Endpoint:** `POST /auth/refresh-token`

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Response (200 SUCCESS):**

```json
{
  "code": 200,
  "message": "SUCCESS",
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 899674
  }
}
```

## Implementation Details

### 1. Registration Flow

#### RegisterPage Component

- **Form Fields:**
  - fullName (required) - min 2 characters
  - username (required) - min 3 characters, alphanumeric + underscore/hyphen
  - email (required) - valid email format
  - password (required) - min 6 characters
  - confirmPassword (required) - must match password
  - dateOfBirth (optional)
  - phone (optional)

- **Validation:**
  - Client-side validation on submit
  - Server-side validation on API
  - Clear error messages for validation failures

- **Process:**
  1. User fills registration form
  2. Client-side validation
  3. POST request to `/auth/register`
  4. On success: Automatic login with provided credentials
  5. Redirect to home page

### 2. Login Flow

#### LoginPage Component

- **Form Fields:**
  - username (required)
  - password (required)

- **Validation:**
  - Required field validation
  - Error message display

- **Process:**
  1. User enters credentials
  2. POST request to `/auth/login`
  3. Store accessToken and refreshToken in localStorage
  4. Set Authorization header with Bearer token
  5. Redirect to home page

### 3. Token Management

#### Storage

- **Access Token:** Stored in `localStorage['access_token']`
- **Refresh Token:** Stored in `localStorage['refresh_token']`
- **Token Prefix:** "Bearer"

#### Automatic Token Refresh

- When API returns 401 status:
  1. Extract refreshToken from localStorage
  2. POST request to `/auth/refresh-token`
  3. Update both tokens in localStorage
  4. Retry original request with new token
  5. If refresh fails: Clear storage, redirect to login

#### Request Interceptor

- Automatically adds Authorization header to all requests
- Format: `Authorization: Bearer {accessToken}`

### 4. AuthContext

#### State

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
}
```

#### Methods

- `login(username, password)` - Authenticate user
- `register(data)` - Register new user
- `logout()` - Clear auth data
- `updateUser(data)` - Update user information

#### Usage

```typescript
const { user, isAuthenticated, login, register, logout } = useAuth();
```

## Key Features

✅ **Clean Code:**

- Comprehensive validation
- Clear error handling
- Type-safe with TypeScript
- Reusable components

✅ **Security:**

- JWT token-based authentication
- Automatic token refresh
- Secure token storage
- Protected routes based on authentication state

✅ **User Experience:**

- Loading states
- Error messages with guidance
- Form validation feedback
- Automatic redirects after auth actions
- Optional fields support

✅ **Error Handling:**

- Network errors
- Invalid credentials
- Token expiration
- Server errors (400, 401, 403, 404, 429, 500, etc.)
- Custom error messages

## File Structure

```
├── contexts/
│   └── AuthContext.tsx (Authentication state & logic)
├── pages/
│   ├── LoginPage.tsx (Login interface)
│   └── RegisterPage.tsx (Registration interface)
├── services/
│   └── api.ts (Axios instance with interceptors)
├── utils/
│   └── apiClient.ts (API method definitions)
├── config/
│   └── apiConfig.ts (API configuration)
└── types.ts (TypeScript interfaces)
```

## Configuration

### Environment Variables

Set in `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=10000
VITE_API_MAX_RETRIES=3
VITE_API_RETRY_DELAY=1000
```

## Usage Examples

### Register New User

```typescript
const { register } = useAuth();

try {
  await register({
    fullName: "Nguyễn Văn Ti",
    username: "nguyenvanti2",
    email: "nguyenvanti2@gmail.com",
    password: "123456",
    confirmPassword: "123456",
  });
  // User is automatically logged in and redirected
} catch (error) {
  console.error("Registration failed:", error);
}
```

### Login User

```typescript
const { login } = useAuth();

try {
  await login("nguyenvanti2", "123456");
  // User is logged in and redirected
} catch (error) {
  console.error("Login failed:", error);
}
```

### Access Auth State

```typescript
const { user, isAuthenticated, token } = useAuth();

if (isAuthenticated) {
  console.log("User:", user);
  console.log("Token:", token);
}
```

### Logout User

```typescript
const { logout } = useAuth();

logout();
// User is logged out and redirected to login page
```

## Security Considerations

1. **Token Storage:** Tokens stored in localStorage are accessible to XSS attacks. Consider using httpOnly cookies for production.

2. **HTTPS:** Always use HTTPS in production to protect tokens in transit.

3. **CORS:** Ensure proper CORS configuration on the backend.

4. **Token Expiration:** The access token has a short expiration time (expiresIn value). Use refresh tokens to extend sessions.

5. **Password:**
   - Minimum 6 characters (API requirement)
   - Consider enforcing stronger requirements (uppercase, numbers, special chars)
   - Always sent over HTTPS

## Troubleshooting

### Login Not Working

- Check API endpoint configuration
- Verify username/password are correct
- Check browser console for API errors
- Ensure API server is running

### Token Refresh Failing

- Check if refreshToken exists in localStorage
- Verify `/auth/refresh-token` endpoint is working
- Check token expiration time
- Clear localStorage and login again

### Redirect Not Working

- Check hash-based routing in App.tsx
- Verify `window.location.hash` is being updated
- Check browser console for errors

### API Errors

- Check API response format matches expected structure
- Verify response has `code`, `message`, and `data` fields
- Check server logs for backend errors

## Testing Credentials

For development:

```
Username: nguyenvanti2
Password: 123456
Email: nguyenvanti2@gmail.com
```

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Social login integration
- [ ] Two-factor authentication
- [ ] Session management
- [ ] Remember me functionality
- [ ] Biometric authentication
- [ ] httpOnly cookies for token storage

## References

- [JWT Authentication](https://jwt.io/)
- [Axios Request/Response Interceptors](https://axios-http.com/docs/interceptors)
- [React Context API](https://react.dev/reference/react/useContext)
- [TypeScript Authentication](https://www.typescriptlang.org/)
