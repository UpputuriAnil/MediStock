package com.medistock.auth;

import com.medistock.dto.*;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse googleLogin(GoogleLoginRequest request);

    void logout(String token);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void verifyEmail(String token);
}
