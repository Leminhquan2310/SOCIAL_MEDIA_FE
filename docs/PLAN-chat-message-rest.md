# Kế hoạch Triển khai: Option A (REST API for Chat)

## 1. Context (Bối cảnh)
Khi mở khung chat với một `tempUser` (người chưa từng nhắn tin), `conversationId` của session là `null`. Việc gửi tin nhắn quá trình Web Socket hiện tại không kết nối được kết quả trả về với cấu trúc local state vì `MessageDto` broadcast lại chỉ có `senderId` (chính là ID của bản thân) và không xác thực được `receiverId`, dẫn tới việc khung chat bị treo do không tìm thấy `tempUser`. Giải pháp thay thế là sử dụng REST API thay cho việc trực tiếp qua giao thức Stomp/Websocket.

## 2. Requirement / Goal
1. Chuyển đổi hàm send message sử dụng REST API (`POST /api/v1/chat/messages`).
2. Nhận kết quả chứa `conversationId` trực tiếp từ HTTP Response để map `tempUser` vào thành một Conversation thực (xoá `tempUser`, thay bằng `conversationId` thật).
3. Xử lý ngăn chặn duplicate message (1 cái lấy từ HTTP response, 1 cái có thể dội lại qua Websocket Subscriber).

## 3. Các bước triển khai (Task Breakdown)

### Phase 1: Cập nhật API Services
- **File**: `src/config/apiConfig.ts`
  - Bổ sung cấu hình `SEND: "/chat/send"` (hoặc `/chat/messages`) vào `API_CONFIG.ENDPOINTS.CHAT`.
- **File**: `src/services/chatApi.ts`
  - Viết thêm hàm `sendMessage(receiverId: number, content: string)` gọi HTTP `POST` theo endpoint cấu hình trên. Hàm trả về kiểu Promise của `MessageDto` (hoặc `ApiResponse<MessageDto>`).

### Phase 2: Refactor ChatContext (Gửi qua API)
- **File**: `src/contexts/ChatContext.tsx`
  - Tìm định nghĩa của hàm truyền thống `sendMessage`.
  - Thay vì `publish('/app/chat.send', ...)`, đưa nó về `async/await` và gọi `chatApi.sendMessage`.
  - Khi hoàn thành API: Trích xuất `msg` (kiểu `MessageDto`) từ payload trả về.
  - Viết logic cập nhật `setOpenChats` thủ công: Tìm `tempUser` (`c.tempUser?.id === receiverId` HOẶC `c.conversationId === msg.conversationId`), cập nhật lại thông tin `conversationId` bằng mã trả về, đồng thời đẩy tin nhắn vào mảng `messages`.

### Phase 3: Ngăn chặn Duplicate (Data Sync)
- **File**: `src/contexts/ChatContext.tsx`
  - Ở hàm `handleIncomingMessage`, phải kiểm tra xem `msg.id` mới dội về từ Websocket đã có trong danh sách chat hiện tại (của `openChats`) hay chưa (tránh render 2 lần cùng 1 tin nhắn do Phase 2 đã ghi thủ công).
  - Hoặc đơn giản: chỉ xử lý `handleIncomingMessage` nếu `msg.senderId !== user.id`. (Vì tin nhắn của mình gửi thì Phase 2 đã tự xử lý State). 

## 4. Agent Assignments
- `backend-specialist`: Kiểm tra và đảm bảo endpoint REST API `POST /chat/messages` hoặc tương đương đã tồn tại và trả về đúng format `MessageDto` với `conversationId` không null. (Nếu chưa có, cần hỗ trợ viết API bên Backend - đây là constraint lớn nhất cần confirm).
- `frontend-specialist`: Implementation Phase 1-3.

## 5. Xác nhận cần thiết (Verification Checklist)
- [ ] Xác nhận Backend Controller hỗ trợ phương thức trả lời trực tiếp cho việc tạo Chat thay vì chỉ `@MessageMapping` qua topic. (Hoặc cần team backend xác nhận mở API Endpoint mới).
- [ ] Gửi thử tin nhắn đầu tiên với TempUser -> Đảm bảo frame UI hiện tin nhắn ngay lập tức.
- [ ] Đóng mở lại frame -> Lịch sử tin nhắn vẫn Load đầy đủ.
- [ ] Reload trang -> Conversation đã xuất hiện trên `ChatDropdown`.
