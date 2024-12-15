import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postApi } from '../../utils/apiClient';

// Tạo bài viết
export const createPostThunk = createAsyncThunk('posts/createPost', async (postData, { rejectWithValue }) => {
    try {
        const response = await postApi.createPost(postData);
        return response.data; // Chỉ trả về data từ API
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
});

// Lấy tất cả bài viết
export const getPostsThunk = createAsyncThunk('posts/getPosts', async (_, { rejectWithValue }) => {
    try {
        const response = await postApi.getPosts();
        return response.data; // Chỉ trả về data từ API
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
});

// Thích bài viết
export const likePostThunk = createAsyncThunk('posts/likePost', async ({ postId, userId }, { rejectWithValue }) => {
    try {
        const response = await postApi.likePost(postId, userId);
        return response.data; // Trả về data từ API
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
});

// Bình luận bài viết
export const addCommentThunk = createAsyncThunk('posts/addComment', async ({ postId, commentData }, { rejectWithValue }) => {
    try {
        const response = await postApi.addComment(postId, commentData);
        return response.data; // Trả về data từ API
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
});

// Định nghĩa slice cho post
const postSlice = createSlice({
    name: 'posts',
    initialState: {
        posts: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder.addCase(createPostThunk.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(createPostThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.posts.unshift(action.payload); // Thêm bài viết mới vào đầu danh sách
        });
        builder.addCase(createPostThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });

        builder.addCase(getPostsThunk.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getPostsThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.posts = action.payload;  // Cập nhật danh sách bài viết
        });
        builder.addCase(getPostsThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });

        builder.addCase(likePostThunk.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(likePostThunk.fulfilled, (state, action) => {
            state.loading = false;
            const updatedPost = action.payload;
            const index = state.posts.findIndex(post => post._id === updatedPost._id);
            if (index !== -1) {
                state.posts[index] = updatedPost;  // Cập nhật bài viết khi được like
            }
        });
        builder.addCase(likePostThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });

        builder.addCase(addCommentThunk.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(addCommentThunk.fulfilled, (state, action) => {
            state.loading = false;
            const updatedComment = action.payload;
            const post = state.posts.find(post => post._id === updatedComment.post_id);
            if (post) {
                post.comments.push(updatedComment);  // Thêm bình luận vào bài viết
            }
        });
        builder.addCase(addCommentThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
    },
});

export default postSlice.reducer;
