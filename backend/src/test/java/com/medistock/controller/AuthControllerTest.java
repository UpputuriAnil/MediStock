package com.medistock.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.auth.AuthService;
import com.medistock.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    private AuthResponse mockAuthResponse;
    private AuthResponse.UserDto mockUserDto;

    @BeforeEach
    void setUp() {
        AuthController authController = new AuthController(authService);
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();

        mockUserDto = new AuthResponse.UserDto(
                1L,
                "user@medistock.com",
                "John",
                "Doe",
                "+1234567890",
                true,
                Set.of("ROLE_STAFF"),
                Set.of("MEDICINE_READ")
        );

        mockAuthResponse = new AuthResponse();
        mockAuthResponse.setAccessToken("mock-access-token");
        mockAuthResponse.setRefreshToken("mock-refresh-token");
        mockAuthResponse.setTokenType("Bearer");
        mockAuthResponse.setExpiresIn(900000L);
        mockAuthResponse.setUser(mockUserDto);
    }

    @Test
    void testLoginSuccess() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("user@medistock.com");
        loginRequest.setPassword("Password@123");

        when(authService.login(any(LoginRequest.class))).thenReturn(mockAuthResponse);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.accessToken").value("mock-access-token"))
                .andExpect(jsonPath("$.data.user.email").value("user@medistock.com"));
    }

    @Test
    void testRegisterSuccess() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("newuser@medistock.com");
        registerRequest.setPassword("Password@123");
        registerRequest.setConfirmPassword("Password@123");
        registerRequest.setFirstName("Jane");
        registerRequest.setLastName("Smith");
        registerRequest.setPhoneNumber("+1987654321");
        registerRequest.setRole("STAFF");

        when(authService.register(any(RegisterRequest.class))).thenReturn(mockAuthResponse);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data.accessToken").value("mock-access-token"));
    }

    @Test
    void testGoogleLoginSuccess() throws Exception {
        GoogleLoginRequest googleRequest = new GoogleLoginRequest();
        googleRequest.setEmail("googleuser@medistock.com");
        googleRequest.setName("Google User");
        googleRequest.setGoogleId("g_12345");
        googleRequest.setRole("STAFF");

        when(authService.googleLogin(any(GoogleLoginRequest.class))).thenReturn(mockAuthResponse);

        mockMvc.perform(post("/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(googleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Google authentication successful"));
    }

    @Test
    void testRefreshTokenSuccess() throws Exception {
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken("mock-refresh-token");

        when(authService.refreshToken(any(RefreshTokenRequest.class))).thenReturn(mockAuthResponse);

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Token refreshed successfully"));
    }

    @Test
    void testLogoutSuccess() throws Exception {
        doNothing().when(authService).logout("mock-token");

        mockMvc.perform(post("/auth/logout")
                        .header("Authorization", "Bearer mock-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Logout successful"));
    }

    @Test
    void testGetCurrentUserSuccess() throws Exception {
        when(authService.getCurrentUser("mock-token")).thenReturn(mockUserDto);

        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer mock-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("user@medistock.com"))
                .andExpect(jsonPath("$.data.firstName").value("John"));
    }
}
