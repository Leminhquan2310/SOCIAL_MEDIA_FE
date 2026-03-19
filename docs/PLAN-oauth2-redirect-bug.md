# PLAN: Khắc phục lỗi Redirect OAuth2 Google

## 1. Phân Tích Nguyên Nhân (Root Cause Analysis)

Khi người dùng đăng nhập bằng Google thành công, Backend gọi Redirect trình duyệt quay về:
`http://localhost:3000/?accessToken=...`

Tuy nhiên, do `<AuthProvider>` (trong `AuthContext.tsx`) không có trạng thái ngăn chặn render sớm (`isInitializing`), nó lập tức render UI (`children`), bao gồm `<Routes>` và `<ProtectedRoute>`.

Ngay lúc này:
1. Giá trị ban đầu của `isAuthenticated` là `false`.
2. Do route là trang chủ (`/`), `<ProtectedRoute>` yêu cầu xác thực nhưng không có quyền nên chèn component `<Navigate to="/login" replace />`.
3. Trong React, Lifecycle (đặc biệt là `useEffect`) của Component Con sẽ chạy TRƯỚC Component Cha. Nghĩa là `<Navigate>` sẽ thực thi việc chuyển hướng về `http://localhost:3000/login` và **xóa sạch** query param (`?accessToken=...`) ĐỒNG THỜI trước khi `useEffect` của `<AuthProvider>` có cơ hội chạy.
4. Khi đó `AuthContext` chạy `handleAuth` thì `window.location.search` đã trống trơn, kết quả là người dùng bị kẹt ngoài trang `/login`.

## 2. Task Breakdown (Đề xuất giải pháp)

### [Task 1] Bổ sung trạng thái `isInitializing` vào AuthContext
- **Mục tiêu:** Trì hoãn việc render UI cho đến khi hoàn tất kiểm tra Token ở lần tải trang đầu tiên.
- **Thực thi:** 
  - Thêm state `[isInitializing, setIsInitializing] = useState(true);` vào `AuthContext`.
  - Nếu `isInitializing` là `true`, trả về `<LoadingOverlay />` (đã có sẵn trong project) để block URL Navigation.
  - Cập nhật hàm `handleAuth` để thiết lập `setIsInitializing(false)` sau khi chạy xong try/catch.

### [Task 2] Cập nhật Interceptor Redirect (Minor Fix)
- **Mục tiêu:** Chuẩn hóa Router.
- **Thực thi:** Trong `src/services/api.ts`, khi Refresh Token hết hạn, đang sử dụng `window.location.href = "#/login"`. Dự án xài `BrowserRouter` nên sửa thành `window.location.href = "/login"` để tránh lỗi tạo Hash ở URL.

## 3. Verification Checklist (Bước kiểm tra)
- [ ] Truy cập trực tiếp link kiểu `http://localhost:3000/?accessToken=fake-token-123`. Xác nhận URL không bị đá sang `/login` ngay tức thời mà hiện Loading, giữ được param để AuthContext xử lý.
- [ ] Thực hiện đăng nhập thực tế bằng "Sign in with Google", ứng dụng tải chốc lát và đưa thẳng vào Home.
- [ ] Xóa Token + Cookies mô phỏng hết phiên, và F5 trang báo lỗi, phải redirect một cách êm ái về page `/login`.

---

> Kế hoạch đã được vạch ra hoàn chỉnh. Chạy lệnh `/create` nếu bạn muốn tôi áp dụng bản vá này ngay lập tức.
