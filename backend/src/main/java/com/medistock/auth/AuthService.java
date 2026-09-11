package com.medistock.auth;

import com.medistock.dto.*;
import com.medistock.dto.ChangePasswordRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse googleLogin(GoogleLoginRequest request);

    void logout(String token);

    AuthResponse refreshToken(RefreshTokenRequest request);

    String forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void verifyEmail(String token);

    void changePassword(String token, ChangePasswordRequest request);

    AuthResponse.UserDto getCurrentUser(String token);
}
