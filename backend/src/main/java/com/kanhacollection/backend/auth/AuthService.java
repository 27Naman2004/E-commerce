package com.kanhacollection.backend.auth;

import com.kanhacollection.backend.auth.dto.*;
import jakarta.servlet.http.HttpServletResponse;

import java.util.UUID;

public interface AuthService {
    AuthResponse register(RegisterRequest request, HttpServletResponse response);
    AuthResponse login(LoginRequest request, HttpServletResponse response);
    AuthResponse refreshToken(String refreshTokenCookie, String requestHeaderToken, HttpServletResponse response);
    void logout(String refreshToken, HttpServletResponse response);
    UserSummaryResponse getCurrentUser(UUID userId);
    void changePassword(UUID userId, ChangePasswordRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
