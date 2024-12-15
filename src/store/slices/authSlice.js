import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userApi } from '../../utils/apiClient';

// Restore session
export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { rejectWithValue }) => {
    try {
        const token = await AsyncStorage.getItem('token');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!token || !refreshToken) {
            return rejectWithValue('No session found');
        }
        return { token, refreshToken };
    } catch (error) {
        return rejectWithValue('Failed to restore session');
    }
});

// Login
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await userApi.login(credentials);
        const { token, refreshToken } = response.data;

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('refreshToken', refreshToken);

        return { token, refreshToken };
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
});

// Get user info
export const getUser = createAsyncThunk('auth/getUser', async (_, { rejectWithValue }) => {
    try {
        const response = await userApi.getUser();
        return response.data; // Trả về thông tin người dùng
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch user info');
    }
});

// Register
export const register = createAsyncThunk('auth/register', async (userInfo, { rejectWithValue }) => {
    try {
        const response = await userApi.register(userInfo);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
});

// Verify OTP
export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (otpData, { rejectWithValue }) => {
    try {
        const response = await userApi.verifyOtp(otpData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to verify OTP');
    }
});


// Action refreshAccessToken
export const refreshAccessToken = createAsyncThunk(
    'auth/refreshAccessToken',
    async (_, { rejectWithValue }) => {
        try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (!refreshToken) {
                return rejectWithValue('No refresh token found');
            }

            const response = await userApi.refreshToken({ refreshToken });
            const { token, refreshToken: newRefreshToken } = response.data;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('refreshToken', newRefreshToken);

            return { token, refreshToken: newRefreshToken };
        } catch (error) {
            return rejectWithValue('Failed to refresh access token');
        }
    }
);

// Gửi OTP reset mật khẩu
export const sendResetPasswordOtp = createAsyncThunk(
    'auth/sendResetPasswordOtp',
    async ({ email }, { rejectWithValue }) => {
        try {
            const response = await userApi.sendResetPasswordOtp({ email });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
        }
    }
);

// Reset mật khẩu với OTP
export const resetPasswordWithOtp = createAsyncThunk(
    'auth/resetPasswordWithOtp',
    async ({ email, otp, newPassword }, { rejectWithValue }) => {
        try {
            const response = await userApi.resetPasswordWithOtp({ email, otp, newPassword });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
        }
    }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        // Gọi API logout
        if (refreshToken) {
            await userApi.logout({ refreshToken });
        }

        // Xóa token khỏi AsyncStorage
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
        return rejectWithValue('Failed to logout');
    }
});

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
    },
    reducers: {
        performLogout(state) {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Restore session
            .addCase(restoreSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(restoreSession.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
            })
            .addCase(restoreSession.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
            })
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Verify OTP
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Refresh Access Token
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
            })
            .addCase(refreshAccessToken.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Send OTP
            .addCase(sendResetPasswordOtp.pending, (state) => {
                state.loading = true;
            })
            .addCase(sendResetPasswordOtp.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(sendResetPasswordOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reset Password
            .addCase(resetPasswordWithOtp.pending, (state) => {
                state.loading = true;
            })
            .addCase(resetPasswordWithOtp.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(resetPasswordWithOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get user info
            .addCase(getUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload; 
            })
            .addCase(getUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { performLogout } = authSlice.actions;
export default authSlice.reducer;
