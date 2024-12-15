import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { friendApi } from '../../utils/apiClient'; // Đường dẫn tới axios client

// Async thunks

// Tìm kiếm người dùng
export const searchUsers = createAsyncThunk(
    'friends/searchUsers',
    async (query, { rejectWithValue }) => {
        try {
            const response = await friendApi.searchUsers(query);
            return response.data.users; // Danh sách người dùng
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Gửi yêu cầu kết bạn
export const sendFriendRequest = createAsyncThunk(
    'friends/sendFriendRequest',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await friendApi.sendFriendRequest({ user2_id: userId });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Chấp nhận yêu cầu kết bạn
export const acceptFriendRequest = createAsyncThunk(
    'friends/acceptFriendRequest',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await friendApi.acceptFriendRequest({ user1_id: userId });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Từ chối hoặc hủy bạn bè
export const removeFriend = createAsyncThunk(
    'friends/removeFriend',
    async (targetUserId, { rejectWithValue }) => {
        try {
            await friendApi.removeFriend({ targetUserId });
            return targetUserId;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Lấy danh sách bạn bè
export const getFriendsList = createAsyncThunk(
    'friends/getFriendsList',
    async (_, { rejectWithValue }) => {
        try {
            const response = await friendApi.getFriendsList();
            return {
                friends: response.data.friends, 
                userId: response.data.userId, 
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Lấy danh sách yêu cầu đã gửi
export const getSentRequests = createAsyncThunk(
    'friends/getSentRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await friendApi.getSentRequests();
            return response.data.users; // Danh sách người nhận yêu cầu
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Lấy danh sách yêu cầu đã nhận
export const getReceivedRequests = createAsyncThunk(
    'friends/getReceivedRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await friendApi.getReceivedRequests();
            return response.data.users; // Danh sách người gửi yêu cầu
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


// Redux Slice
const friendSlice = createSlice({
    name: 'friends',
    initialState: {
        users: [], // Danh sách người dùng tìm kiếm
        friends: [], // Danh sách bạn bè
        sentRequests: [], // Danh sách yêu cầu đã gửi
        receivedRequests: [], // Danh sách yêu cầu đã nhận
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Search Users
            .addCase(searchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(searchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Send Friend Request
            .addCase(sendFriendRequest.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user._id !== action.meta.arg);
            })
            .addCase(sendFriendRequest.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Accept Friend Request
            .addCase(acceptFriendRequest.fulfilled, (state, action) => {
                state.friends.push(action.payload);
                state.receivedRequests = state.receivedRequests.filter(
                    request => request._id !== action.meta.arg
                );
            })
            .addCase(acceptFriendRequest.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Remove Friend
            .addCase(removeFriend.fulfilled, (state, action) => {
                state.friends = state.friends.filter(friend => friend._id !== action.payload);
                state.sentRequests = state.sentRequests.filter(
                    request => request._id !== action.payload
                );
                state.receivedRequests = state.receivedRequests.filter(
                    request => request._id !== action.payload
                );
            })
            .addCase(removeFriend.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Get Friends List
            .addCase(getFriendsList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFriendsList.fulfilled, (state, action) => {
                state.loading = false;
                state.friends = action.payload.friends;
                state.userId = action.payload.userId;
            })
            .addCase(getFriendsList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Sent Requests
            .addCase(getSentRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSentRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.sentRequests = action.payload;
            })
            .addCase(getSentRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Received Requests
            .addCase(getReceivedRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getReceivedRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.receivedRequests = action.payload;
            })
            .addCase(getReceivedRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default friendSlice.reducer;

