# Global Loading Context - Documentation

## Overview

A global loading overlay system has been implemented for the entire NexusSocial application. This provides a centralized way to show loading indicators during async operations.

## Components

### 1. **LoadingContext** (`contexts/LoadingContext.tsx`)

- Provides global loading state management
- Exposes `isLoading` and `loadingMessage`
- Methods: `showLoading()`, `hideLoading()`

### 2. **LoadingOverlay** (`components/LoadingOverlay.tsx`)

- Visual loading component with spinner and message
- Renders as a full-screen overlay when active
- Uses Loader icon from lucide-react

### 3. **useLoadingAsync** Hook (`hooks/useLoadingAsync.ts`)

- Utility hook for automatic loading state management
- Wraps async operations with loading overlay
- Automatically shows/hides loading state

## Usage

### Basic Usage in Components

```typescript
import { useLoading } from "../contexts/LoadingContext";

function MyComponent() {
  const { showLoading, hideLoading } = useLoading();

  const handleAsyncOperation = async () => {
    showLoading("Loading...");
    try {
      // Your async operation
      await someAsyncFunction();
    } finally {
      hideLoading();
    }
  };

  return <button onClick={handleAsyncOperation}>Click Me</button>;
}
```

### Using useLoadingAsync Hook (Recommended)

```typescript
import { useLoadingAsync } from "../hooks/useLoadingAsync";

function MyComponent() {
  const { executeAsync } = useLoadingAsync();

  const handleAsyncOperation = async () => {
    await executeAsync(someAsyncFunction(), "Processing...");
  };

  return <button onClick={handleAsyncOperation}>Click Me</button>;
}
```

## Architecture

The loading system is wrapped around the entire application:

```
App.tsx
  └── BrowserRouter
      └── LoadingProvider
          ├── LoadingOverlay
          └── AuthProvider
              └── Routes
```

## Color Scheme

- **Overlay Background**: `bg-black bg-opacity-50` (semi-transparent)
- **Spinner Color**: `text-blue-600`
- **Spinner Animation**: `animate-spin`

## Registration Flow Changes

### Before

1. User fills registration form
2. Submits registration
3. Auto-login after successful registration
4. Redirect to home page

### After

1. User fills registration form
2. Submits registration
3. Registration succeeds (no auto-login)
4. Shows success message
5. After 2 seconds, redirect to login page
6. User must manually login to access home page

This provides better security by ensuring that:

- Credentials are explicitly entered at login
- Registration and authentication are separate flows
- Users confirm their credentials work before accessing the app

## API Integration Example

```typescript
// In RegisterPage.tsx
const { register } = useAuth();
const { showLoading, hideLoading } = useLoading();

const handleRegisterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  showLoading("Creating your account...");

  try {
    await register(registrationData);
    setSuccess("Registration successful! Redirecting to login...");
    hideLoading();

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  } catch (err) {
    setError(handleApiError(err));
    hideLoading();
  }
};
```

## Best Practices

1. **Always call hideLoading()**: Use try-finally or useLoadingAsync to ensure loading is hidden
2. **Descriptive Messages**: Provide clear, user-friendly loading messages
3. **Timeout Prevention**: For long-running operations, consider adding a timeout
4. **Error Handling**: Make sure errors properly hide the loading state

## Components Updated

✅ **LoginPage.tsx**

- Now uses `useLoading` hook
- Shows "Signing in..." message during login
- Maintains authentication redirect behavior

✅ **RegisterPage.tsx**

- Now uses `useLoading` hook
- Shows "Creating your account..." message during registration
- Removed auto-login after registration
- Redirects to login page after 2 seconds
- Removed `isAuthenticated` watcher useEffect

✅ **App.tsx**

- Wrapped with LoadingProvider
- Added LoadingOverlay component
- Maintains all routing functionality

## Future Enhancements

- Add timeout threshold for long-running operations
- Add abort signal support for cancellable operations
- Add loading progress indicator for multi-step operations
- Add loading state persistence to localStorage for offline support
