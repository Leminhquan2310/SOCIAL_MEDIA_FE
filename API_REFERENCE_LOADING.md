# Loading Context - API Reference

## Quick Reference

```typescript
import { useLoading } from "../contexts/LoadingContext";
import { useLoadingAsync } from "../hooks/useLoadingAsync";

// Method 1: Manual control
const { isLoading, loadingMessage, showLoading, hideLoading } = useLoading();

// Method 2: Automatic handling (recommended)
const { executeAsync } = useLoadingAsync();
```

---

## useLoading() Hook

### Returns

```typescript
{
  isLoading: boolean;              // Whether loading is active
  loadingMessage: string;          // Current loading message
  showLoading: (message?: string) => void;  // Show loading overlay
  hideLoading: () => void;         // Hide loading overlay
}
```

### Methods

#### showLoading(message?: string)

Shows the loading overlay with an optional message.

```typescript
// With custom message
showLoading("Processing payment...");

// With default message
showLoading(); // Defaults to "Loading..."

// Without message
showLoading("");
```

#### hideLoading()

Hides the loading overlay.

```typescript
hideLoading();
```

### Examples

#### Example 1: Basic API Call

```typescript
import { useLoading } from "../contexts/LoadingContext";

function UserProfile() {
  const { showLoading, hideLoading } = useLoading();

  const loadUserData = async () => {
    showLoading("Loading profile...");
    try {
      const data = await fetchUserProfile();
      setUserData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      hideLoading();
    }
  };

  return (
    <button onClick={loadUserData}>Load Profile</button>
  );
}
```

#### Example 2: Multiple Operations

```typescript
const handleComplexOperation = async () => {
  try {
    showLoading("Step 1: Validating...");
    await validateData();

    showLoading("Step 2: Uploading...");
    await uploadData();

    showLoading("Step 3: Processing...");
    await processData();

    hideLoading();
    setSuccess("All steps completed!");
  } catch (error) {
    hideLoading();
    setError(error.message);
  }
};
```

#### Example 3: With Timeout

```typescript
const handleOperationWithTimeout = async () => {
  showLoading("Processing...");

  const timeoutId = setTimeout(() => {
    hideLoading();
    setError("Operation timed out");
  }, 5000);

  try {
    await longOperation();
    clearTimeout(timeoutId);
    hideLoading();
  } catch (error) {
    clearTimeout(timeoutId);
    hideLoading();
    setError(error.message);
  }
};
```

---

## useLoadingAsync() Hook

### Returns

```typescript
{
  executeAsync: <T>(promise: Promise<T>, message?: string) => Promise<T>;
}
```

### Methods

#### executeAsync(promise, message?)

Executes an async operation with automatic loading state management.

```typescript
// Execute with custom message
const result = await executeAsync(apiCall(), "Saving...");

// Execute with default message
const result = await executeAsync(apiCall());
```

### Examples

#### Example 1: Simple Usage

```typescript
import { useLoadingAsync } from "../hooks/useLoadingAsync";

function SaveButton() {
  const { executeAsync } = useLoadingAsync();

  const handleSave = async () => {
    try {
      await executeAsync(saveData(), "Saving changes...");
      setSuccess("Saved!");
    } catch (error) {
      setError(error.message);
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

#### Example 2: With React Query

```typescript
const { executeAsync } = useLoadingAsync();

const saveMutation = useMutation((data) => executeAsync(saveToServer(data), "Saving..."), {
  onSuccess: () => setSuccess("Saved!"),
  onError: (error) => setError(error.message),
});
```

#### Example 3: Sequential Operations

```typescript
const { executeAsync } = useLoadingAsync();

const handleMultiStep = async () => {
  try {
    const step1 = await executeAsync(fetchData(), "Loading data...");

    const step2 = await executeAsync(processData(step1), "Processing...");

    const step3 = await executeAsync(saveResults(step2), "Saving results...");

    setSuccess("Complete!");
  } catch (error) {
    setError(error.message);
  }
};
```

---

## LoadingContext Provider

### Props

```typescript
interface LoadingProviderProps {
  children: React.ReactNode;
}
```

### Usage

Wrap your app with LoadingProvider (already done in App.tsx):

```typescript
<LoadingProvider>
  <YourApp />
</LoadingProvider>
```

---

## LoadingOverlay Component

### Props

No props - uses context internally.

### Usage

Add LoadingOverlay to your app (already done in App.tsx):

```typescript
import LoadingOverlay from "./components/LoadingOverlay";

function App() {
  return (
    <LoadingProvider>
      <LoadingOverlay />
      {/* Your app */}
    </LoadingProvider>
  );
}
```

---

## Real-World Examples

### Example 1: Login Form

```typescript
import { useLoading } from "../contexts/LoadingContext";

function LoginForm() {
  const { showLoading, hideLoading } = useLoading();
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    showLoading("Signing in...");

    try {
      await login(username, password);
      // Auto-redirect happens via useEffect
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      hideLoading();
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
    </form>
  );
}
```

### Example 2: Profile Update

```typescript
import { useLoadingAsync } from "../hooks/useLoadingAsync";

function EditProfile() {
  const { executeAsync } = useLoadingAsync();

  const handleSave = async () => {
    try {
      await executeAsync(
        updateProfile(formData),
        "Updating profile..."
      );
      setSuccess("Profile updated!");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSave();
    }}>
      {/* Form fields */}
    </form>
  );
}
```

### Example 3: File Upload

```typescript
import { useLoadingAsync } from "../hooks/useLoadingAsync";

function FileUpload() {
  const { executeAsync } = useLoadingAsync();

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await executeAsync(
        uploadFile(formData),
        `Uploading ${file.name}...`
      );

      setSuccess("File uploaded!");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <input
      type="file"
      onChange={(e) => handleUpload(e.target.files?.[0]!)}
    />
  );
}
```

### Example 4: Data Fetch with Pagination

```typescript
import { useLoadingAsync } from "../hooks/useLoadingAsync";

function DataList() {
  const { executeAsync } = useLoadingAsync();
  const [page, setPage] = useState(1);

  const loadPage = async (pageNum: number) => {
    try {
      const data = await executeAsync(
        fetchData({ page: pageNum }),
        `Loading page ${pageNum}...`
      );
      setData(data);
      setPage(pageNum);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      {/* List items */}
      <button onClick={() => loadPage(page + 1)}>Next</button>
    </div>
  );
}
```

---

## Error Handling

### Pattern 1: Try-Catch-Finally

```typescript
const { showLoading, hideLoading } = useLoading();

const operation = async () => {
  showLoading();
  try {
    await asyncOperation();
  } catch (error) {
    handleError(error);
  } finally {
    hideLoading();
  }
};
```

### Pattern 2: Promise Chain

```typescript
showLoading("Loading...")
  .then(() => asyncOperation())
  .then(handleSuccess)
  .catch(handleError)
  .finally(hideLoading);
```

### Pattern 3: Async/Await (Recommended)

```typescript
const { executeAsync } = useLoadingAsync();

try {
  await executeAsync(asyncOperation(), "Loading...");
} catch (error) {
  handleError(error);
}
```

---

## TypeScript Usage

### Type Definition

```typescript
interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}
```

### Typed Hook Usage

```typescript
import { useLoading } from "../contexts/LoadingContext";

function MyComponent(): JSX.Element {
  const { showLoading, hideLoading }: LoadingContextType = useLoading();

  return <div>My Component</div>;
}
```

---

## Debugging

### Check Loading State

```typescript
function DebugComponent() {
  const { isLoading, loadingMessage } = useLoading();

  return (
    <div>
      <p>Is Loading: {String(isLoading)}</p>
      <p>Message: {loadingMessage}</p>
    </div>
  );
}
```

### Console Logging

```typescript
const { showLoading, hideLoading } = useLoading();

const operation = async () => {
  console.log("Showing loading...");
  showLoading("Processing");

  try {
    await asyncOp();
    console.log("Success!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    console.log("Hiding loading...");
    hideLoading();
  }
};
```

---

## Performance Tips

1. **Use useLoadingAsync** - Auto-cleanup prevents memory leaks
2. **Avoid nested showLoading calls** - Use sequential messages instead
3. **Set reasonable timeouts** - Don't leave overlay indefinitely
4. **Batch operations** - Group related async calls
5. **Memoize callbacks** - Use useCallback to prevent re-renders

---

## API Status Codes

```typescript
// Success cases
showLoading("Processing..."); // 200, 201
hideLoading(); // After response

// Error cases
showLoading("Retrying..."); // Automatic on 5xx
hideLoading(); // After error handled
```

---

**Last Updated**: February 11, 2026
**Version**: 1.0
