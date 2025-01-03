import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import friendReducer from './slices/friendSlice';
import chatReducer from './slices/chatSlice';
import messageReducer from './slices/messageSlice';
import notificationReducer from './slices/notificationSlice';
 
const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postReducer,
        friends: friendReducer,
        chats: chatReducer,
        messages: messageReducer,
        notifications: notificationReducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: false, // Disable the immutable state check
            serializableCheck: false, // Optionally disable serializable check if needed
        }),
});

export default store;
