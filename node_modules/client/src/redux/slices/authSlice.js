import { createSlice } from '@reduxjs/toolkit';

const userFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userInfo: userFromStorage,
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      state.error = null;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
      if (action.payload.accessToken) {
        localStorage.setItem('accessToken', action.payload.accessToken);
      }
    },
    logout: (state) => {
      state.userInfo = null;
      state.error = null;
      localStorage.removeItem('userInfo');
      localStorage.removeItem('accessToken');
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setCredentials, logout, setAuthLoading, setAuthError } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.userInfo;
export const selectIsAdmin = (state) => state.auth.userInfo?.role === 'admin';
