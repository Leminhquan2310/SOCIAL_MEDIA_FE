import React, { useEffect, useState } from 'react';
import { MessagePreview } from '../../contexts/ChatContext';

interface MessageToastProps {
    preview: MessagePreview;
    /** Khoảng cách từ dưới lên (để có thể stack nhiều toast nếu cần) */
    bottomOffset: number;
    onOpen: () => void;
    onDismiss: () => void;
}

/**
 * Hiển thị popup preview tin nhắn mới với Avatar và Nội dung tin nhắn.
 * Nó luôn nằm trên màn hình cho đến khi người dùng click vào hoặc bấm tắt (✕).
 */
const MessageToast: React.FC<MessageToastProps> = ({
    preview,
    bottomOffset,
    onOpen,
    onDismiss,
}) => {
    const [visible, setVisible] = useState(false);

    // Fade-in effect khi mới xuất hiện, tự động đóng sau 5s
    useEffect(() => {
        // Sử dụng setTimeout 50ms thay vì rAF để đảm bảo trình duyệt đã paint frame đầu tiên 
        // ở trạng thái opacity=0 trước khi chuyển lên 1, giúp animation chạy đúng.
        const show = setTimeout(() => setVisible(true), 50);

        // Tự động đóng sau 5 giây
        const hide = setTimeout(() => {
            setVisible(false);
            // Đợi CSS transition fade-out (300ms) kết thúc mới gọi hàm onDismiss xoá khỏi DOM
            setTimeout(onDismiss, 300);
        }, 5000);

        return () => {
            clearTimeout(show);
            clearTimeout(hide);
        };
    }, [onDismiss]);

    const avatarSrc =
        preview.senderAvatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(preview.senderName)}&background=random`;

    return (
        <div
            className="fixed z-[70] transition-all duration-300"
            style={{
                right: 80, // Để không đè lên cột dọc các bubble ở right-4
                bottom: bottomOffset,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(24px)',
            }}
        >
            <div
                onClick={onOpen}
                className="w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            >
                {/* Content */}
                <div className="flex items-center gap-3 px-3 py-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <img
                            src={avatarSrc}
                            className="w-10 h-10 rounded-full object-cover border border-gray-100"
                            alt={preview.senderName}
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                    </div>

                    {/* Text Preview */}
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-[13px] text-gray-900 truncate">
                            {preview.senderName}
                        </p>
                        <p className="text-[12px] text-gray-500 truncate mt-0.5">
                            {preview.content}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageToast;
