import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../api/authApi';

// ========== Async Thunks ==========

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      const { token, member } = response.data.data;
      localStorage.setItem('token', token);
      return { token, member };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '로그인에 실패했습니다'
      );
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.signup(userData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '회원가입에 실패했습니다'
      );
    }
  }
);

export const fetchMyInfo = createAsyncThunk(
  'auth/fetchMyInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getMyInfo();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '정보를 불러올 수 없습니다'
      );
    }
  }
);

// ========== Slice ==========

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // === Login ===
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.member;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // === Signup ===
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // === Fetch My Info ===
      .addCase(fetchMyInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMyInfo.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
