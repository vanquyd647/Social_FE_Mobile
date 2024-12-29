import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi } from '../../utils/apiClient';

// Async Thunk: Lấy danh sách thông báo
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationApi.getNotifications();
            return response.data.notifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

// Async Thunk: Đánh dấu thông báo đã đọc
export const markNotificationAsRead = createAsyncThunk(
    'notifications/markNotificationAsRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            await notificationApi.markAsRead(notificationId);
            return notificationId;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
        }
    }
);

// Slice
const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        notifications: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Mark Notification as Read
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                state.notifications = state.notifications.map((notification) =>
                    notification._id === action.payload
                        ? { ...notification, is_read: true }
                        : notification
                );
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearError } = notificationSlice.actions;
export default notificationSlice.reducer;
