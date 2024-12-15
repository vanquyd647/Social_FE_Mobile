// messageSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageApi } from '../../utils/apiClient';

// Thunk for sending a message
export const sendMessage = createAsyncThunk(
    'messages/sendMessage',
    async ({ roomId, messageData }, { rejectWithValue }) => {
        try {
            const response = await messageApi.sendMessage(roomId, messageData);
            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Thunk for getting messages with pagination (limit and cursor)
export const getMessagesInRoom = createAsyncThunk(
    'messages/getMessagesInRoom',
    async ({ roomId, limit = 20, cursor = null }, { rejectWithValue }) => {
        try {
            const response = await messageApi.getMessagesInRoom(roomId, limit, cursor);
            return {
                messages: response.data.messages,
                nextCursor: response.data.nextCursor,
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    rooms: {}, // Lưu trữ tin nhắn theo từng roomId
    loadingFetch: false,
    loadingSend: false,
    error: null,
};

const messageSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        receiveMessage: (state, action) => {
            const { roomId, message } = action.payload;
            if (!state.rooms[roomId]) state.rooms[roomId] = { messages: [], cursor: null, hasMore: true };
            state.rooms[roomId].messages.unshift(message); // Add new message to the top for inverted FlatList
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMessagesInRoom.pending, (state, action) => {
                const { roomId } = action.meta.arg;
                if (!state.rooms[roomId]) state.rooms[roomId] = { messages: [], cursor: null, hasMore: true };
                state.loadingFetch = true;
            })
            .addCase(getMessagesInRoom.fulfilled, (state, action) => {
                state.loadingFetch = false;
                const { roomId } = action.meta.arg;
                const { messages, nextCursor } = action.payload;
                if (messages.length > 0) {
                    const room = state.rooms[roomId];
                    room.messages = room.cursor ? [...room.messages, ...messages] : messages;
                    room.cursor = nextCursor;
                    room.hasMore = !!nextCursor;
                } else {
                    state.rooms[roomId].hasMore = false;
                }
                state.error = null;
            })
            .addCase(getMessagesInRoom.rejected, (state, action) => {
                state.loadingFetch = false;
                state.error = action.payload;
            });
    },
});

export const { receiveMessage } = messageSlice.actions;
export default messageSlice.reducer;
