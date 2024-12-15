import { refreshAccessToken } from '../store/slices/authSlice';
import store from '../store';

const handleExpiredToken = async (error, apiClient) => {
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi là 403 (Forbidden) và thông báo lỗi liên quan đến token
    if (
        error.response?.status === 403 &&
        error.response?.data?.message === 'Invalid or expired token.' &&
        !originalRequest._retry
    ) {
        originalRequest._retry = true; // Đánh dấu là đã thử làm mới token

        try {
            // Gửi yêu cầu làm mới token
            const result = await store.dispatch(refreshAccessToken());

            if (result.payload?.token) {
                // Lưu token mới vào header và thực hiện lại request
                console.log("Token refreshed successfully");
                originalRequest.headers['Authorization'] = `Bearer ${result.payload.token}`;
                return apiClient(originalRequest);
            }
        } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError.message);

            // Nếu làm mới token thất bại, logout người dùng và thông báo lỗi
            store.dispatch(logout()); // Xử lý logout
            return Promise.reject({
                ...refreshError,
                message: 'Session expired. Please log in again.',
            });
        }
    }

    return Promise.reject(error); // Trả lỗi nếu không phải lỗi token
};

export default handleExpiredToken;
