import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, logoutUser, updateUserProfile, uploadUserAvatar, setupTwoFactor, enableTwoFactor, verifyTwoFactorCode } from '../store/authSlice';
import { RootState, AppDispatch } from '../store';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const login = useCallback(async (email: string, password: string) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      return result.payload;
    }
    return null;
  }, [dispatch]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    await dispatch(registerUser({ username, email, password }));
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // dispatch(getProfile());
    }
  }, [dispatch]);

  const updateProfile = useCallback(async (data: any) => {
    await dispatch(updateUserProfile(data));
  }, [dispatch]);

  const uploadAvatar = useCallback(async (file: File) => {
    await dispatch(uploadUserAvatar(file));
  }, [dispatch]);

  const setup2FA = useCallback(async () => {
    const result = await dispatch(setupTwoFactor());
    return result.payload;
  }, [dispatch]);

  const enable2FA = useCallback(async (code: string) => {
    await dispatch(enableTwoFactor(code));
  }, [dispatch]);

  const verify2FA = useCallback(async (tempToken: string, code: string) => {
    const result = await dispatch(verifyTwoFactorCode({ tempToken, code }));
    return result.payload;
  }, [dispatch]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    uploadAvatar,
    setup2FA,
    enable2FA,
    verify2FA,
  };
};
