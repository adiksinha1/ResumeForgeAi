import { createSlice } from '@reduxjs/toolkit';
import { authAPI } from '../services/api.js';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    }
  }
});

export const { authStart, authSuccess, authFailure, logoutSuccess } = authSlice.actions;

// Async Thunks
export const registerUser = (data) => async (dispatch) => {
  dispatch(authStart());
  try {
    const res = await authAPI.register(data);
    localStorage.setItem('token', res.data.token);
    dispatch(authSuccess({ user: res.data.user, token: res.data.token }));
    return { success: true };
  } catch (err) {
    let errorMsg = err.response?.data?.error || 'Registration failed';
    if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
      errorMsg = err.response.data.details.map(d => d.message).join(', ');
    }
    dispatch(authFailure(errorMsg));
    return { success: false, error: errorMsg };
  }
};

export const loginUser = (data) => async (dispatch) => {
  dispatch(authStart());
  try {
    const res = await authAPI.login(data);
    localStorage.setItem('token', res.data.token);
    dispatch(authSuccess({ user: res.data.user, token: res.data.token }));
    return { success: true };
  } catch (err) {
    let errorMsg = err.response?.data?.error || 'Login failed';
    if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
      errorMsg = err.response.data.details.map(d => d.message).join(', ');
    }
    dispatch(authFailure(errorMsg));
    return { success: false, error: errorMsg };
  }
};

export const demoLoginUser = () => async (dispatch) => {
  dispatch(authStart());
  try {
    const res = await authAPI.demoLogin();
    localStorage.setItem('token', res.data.token);
    dispatch(authSuccess({ user: res.data.user, token: res.data.token }));
    return { success: true };
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Demo login failed';
    dispatch(authFailure(errorMsg));
    return { success: false, error: errorMsg };
  }
};

export const logoutUser = () => (dispatch) => {
  localStorage.removeItem('token');
  dispatch(logoutSuccess());
};

export const checkAuthUser = () => async (dispatch, getState) => {
  const token = getState().auth.token || localStorage.getItem('token');
  if (!token) return dispatch(authFailure(null));

  dispatch(authStart());
  try {
    const res = await authAPI.fetchMe();
    dispatch(authSuccess({ user: res.data.user, token }));
  } catch (err) {
    localStorage.removeItem('token');
    dispatch(authFailure(null));
  }
};

export default authSlice.reducer;
