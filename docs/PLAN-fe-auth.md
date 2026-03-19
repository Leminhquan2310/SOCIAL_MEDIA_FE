# Kế Hoạch Frontend: Hoàn Thiện Authentication Security

Dựa trên các thay đổi ở Backend (JWT, Refresh Token qua Cookie, OAuth2 Auto-link), Frontend cần được cập nhật để đồng bộ luồng xác thực.

## 1. Mục Tiêu
1. Cấu hình API Client (`axios`) hỗ trợ gửi/nhận Cookie (`withCredentials`).
2. Xử lý lưu trữ `accessToken` trong LocalStorage (hoặc Memory) và để `refreshToken` cho Browser tự quản lý qua Cookie.
3. Cập nhật cơ chế Refresh Token: Khi API trả về 401, gọi endpoint `/refresh-token` mà không cần truyền body (vì Token nằm trong Cookie).
4. Xử lý luồng OAuth2: Sau khi Backend redirect về FE với `accessToken` trên URL, FE phải trích xuất token này và lưu vào hệ thống.
5. Cập nhật Form Đăng ký: Tối giản chỉ yêu cầu `username` và `password` và `confirmPassword`.

---

## 2. Các Bước Thực Hiện Chi Tiết

### 2.1. Cấu hình API (`api.ts` & `apiConfig.ts`)
- Thêm `withCredentials: true` vào instance axios mặc định.
- Cập nhật interceptor:
  - **Request**: Đính kèm Access Token vào Header.
  - **Response**: Nếu gặp lỗi 401, thực hiện Refresh Token logic. Lưu ý: Không cần đọc `refreshToken` từ LocalStorage nữa.

### 2.2. Xử lý OAuth2 Redirect
- Tại trang chủ hoặc trang Login, thêm logic kiểm tra URL Query Params: `?accessToken=...`.
- Nếu có, lưu token vào LocalStorage và cập nhật trạng thái đăng nhập (AuthContext).
- Xóa query param trên URL để URL trông sạch sẽ hơn.

### 2.3. Cập nhật UI Components
- **Register.tsx**: Ẩn hoặc cho phép bỏ qua các trường `email`, `fullName` ở bước đăng ký đầu tiên.
- **Login.tsx**: Đảm bảo nút Google/Facebook dẫn link về endpoint `/oauth2/authorize/...` của Backend.

---

## 3. Xác Minh (Verification)
- [ ] Login Local thành công, có cookie `refreshToken`.
- [ ] Xóa `accessToken` thủ công để test cơ chế tự động Refresh.
- [ ] Login Google thành công thông qua Auto-link.
- [ ] Logout thành công (Xóa cả state FE và Cookie BE).
