import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatApi } from '../../utils/apiClient';

// Thunk để tạo phòng chat mới
export const createChatRoom = createAsyncThunk(
    'chats/createChatRoom',
    async (chatData, { rejectWithValue }) => {
        try {
            const response = await chatApi.createChatRoom(chatData);  // Gọi API để tạo phòng chat
            return response.data; // Trả về dữ liệu chat room từ server (bao gồm cả 'chatRoom' và thông báo)
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message); // Trả về lỗi nếu có
        }
    }
);

// Thunk để lấy danh sách phòng chat của người dùng
export const getUserChats = createAsyncThunk(
    'chats/getUserChats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await chatApi.getUserChats(); // Gọi API để lấy danh sách phòng chat
            return {
                chatRooms: response.data.chatRooms, // Danh sách phòng chat
                userId: response.data.userId,       // userId của người dùng
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message); // Trả về lỗi nếu có
        }
    }
);

// Slice cho chức năng chat
const chatSlice = createSlice({
    name: 'chats',
    initialState: {
        chatRooms: [],
        currentChatRoom: null,
        userId: null,  // Thêm userId vào state
        loading: false,
        error: null,
    },
    reducers: {
        setCurrentChatRoom: (state, action) => {
            state.currentChatRoom = action.payload; // Cập nhật phòng chat hiện tại
        },
    },
    extraReducers: (builder) => {
        builder
            // Xử lý action 'createChatRoom'
            .addCase(createChatRoom.pending, (state) => {
                state.loading = true;  // Đang tạo phòng chat
                state.error = null;
            })
            .addCase(createChatRoom.fulfilled, (state, action) => {
                state.loading = false; // Tạo phòng chat thành công
                // Thêm phòng chat mới vào danh sách
                state.chatRooms.push(action.payload.chatRoom);
            })
            .addCase(createChatRoom.rejected, (state, action) => {
                state.loading = false; // Lỗi khi tạo phòng chat
                state.error = action.payload || 'Failed to create chat room'; // Hiển thị thông báo lỗi
            })

            // Xử lý action 'getUserChats'
            .addCase(getUserChats.pending, (state) => {
                state.loading = true;  // Đang lấy danh sách phòng chat
                state.error = null;
            })
            .addCase(getUserChats.fulfilled, (state, action) => {
                state.loading = false; // Lấy danh sách phòng chat thành công
                state.chatRooms = action.payload.chatRooms;  // Cập nhật danh sách phòng chat
                state.userId = action.payload.userId;  // Cập nhật userId
            })
            .addCase(getUserChats.rejected, (state, action) => {
                state.loading = false; // Lỗi khi lấy danh sách phòng chat
                state.error = action.payload || 'Failed to fetch chat rooms'; // Hiển thị thông báo lỗi
            });
    },
});

// Export actions để sử dụng ngoài component
export const { setCurrentChatRoom } = chatSlice.actions;

export default chatSlice.reducer;
