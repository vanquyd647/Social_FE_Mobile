import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import handleExpiredToken from '../utils/authMiddleware'; // Import middleware

// Tạo một client axios chung
const apiClient = axios.create({
    // baseURL: 'https://social-be-hyzv.onrender.com/api/', // Base URL của API backend http://10.0.2.2:5559/api/
    baseURL: 'http://192.168.0.105:5559/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Middleware: Gắn access token vào request
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token'); // Lấy access token từ AsyncStorage
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Middleware: Xử lý token hết hạn và tự động làm mới
apiClient.interceptors.response.use(
    (response) => response, // Trả về response nếu thành công
    (error) => handleExpiredToken(error, apiClient) // Sử dụng middleware tách riêng
);

// API cho users
const userApi = {
    register: (userData) => apiClient.post('users/register', userData),
    verifyOtp: (otpData) => apiClient.post('users/verify-otp', otpData),
    login: (loginData) => apiClient.post('users/login', loginData),
    getUser: () => apiClient.get('users/user'),
    logout: (logoutData) => apiClient.post('users/logout', logoutData),
    refreshToken: (data) => apiClient.post('users/refresh-token', data),
    sendResetPasswordOtp: (emailData) => apiClient.post('users/send-reset-password-otp', emailData),
    resetPasswordWithOtp: (resetData) => apiClient.post('users/reset-password', resetData),
};

// API cho posts
const postApi = {
    createPost: (postData) => apiClient.post('posts', postData),
    getPosts: () => apiClient.get('posts'),
    likePost: (postId, userId) => apiClient.post(`posts/${postId}/like`, { user_id: userId }),
    addComment: (postId, commentData) => apiClient.post(`posts/${postId}/comment`, commentData),
};

// API cho friendships
const friendApi = {
    searchUsers: (query) => apiClient.get(`friendships/search`, { params: { query } }),
    sendFriendRequest: (data) => apiClient.post('friendships/send', data),
    acceptFriendRequest: (data) => apiClient.post('friendships/accept', data),
    removeFriend: (data) => apiClient.delete('friendships/remove', { data }),
    getFriendsList: () => apiClient.get('friendships/list'),
    getSentRequests: () => apiClient.get('friendships/requests'),
    getReceivedRequests: () => apiClient.get('friendships/pending'),
};

// API cho chat
const chatApi = {
    createChatRoom: (chatData) => apiClient.post('chats/create', chatData),
    getUserChats: () => apiClient.get('chats/chatrooms'),
};

// API for messages
const messageApi = {
    // Send a message in a specific chat room
    sendMessage: (roomId, messageData) => apiClient.post(`/messages/${roomId}/send`, messageData),

    // Lấy tin nhắn trong phòng chat theo phân trang
    getMessagesInRoom: (roomId, limit = 20, cursor = null) => {
        // Thêm tham số limit và cursor vào request
        return apiClient.get(`/messages/${roomId}/messages`, {
            params: {
                limit,    // Số lượng tin nhắn mỗi lần gọi
                cursor,   // Tin nhắn cuối cùng để lấy tin nhắn tiếp theo
            },
        });
    },

};

export { userApi, postApi, friendApi, chatApi, messageApi }; // Export APIs
