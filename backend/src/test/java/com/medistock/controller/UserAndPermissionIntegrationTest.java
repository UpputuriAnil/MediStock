package com.medistock.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.dto.CreatePermissionRequest;
import com.medistock.dto.LoginRequest;
import com.medistock.dto.PermissionDto;
import com.medistock.dto.UserResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class UserAndPermissionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;

    @BeforeEach
    void obtainAdminToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("admin@medistock.com");
        loginRequest.setPassword("Admin@123");

        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        this.jwtToken = root.path("data").path("accessToken").asText();
    }

    @Test
    @DisplayName("Integration: GET /permissions - Should return 200 OK with admin token")
    void testGetAllPermissionsIntegration() throws Exception {
        mockMvc.perform(get("/permissions")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Integration: GET /permissions with Double Bearer (Swagger UI resilience) - Should return 200 OK")
    void testGetPermissionsDoubleBearerIntegration() throws Exception {
        mockMvc.perform(get("/permissions")
                        .header("Authorization", "Bearer Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Integration: GET /permissions/name/USER_READ - Should return 200 OK")
    void testGetPermissionByNameIntegration() throws Exception {
        mockMvc.perform(get("/permissions/name/USER_READ")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.category").value("USER"));
    }

    @Test
    @DisplayName("Integration: POST, PUT, DELETE /permissions - Full CRUD lifecycle should return 200/201 OK")
    void testPermissionLifecycleIntegration() throws Exception {
        String uniquePerm = "PERM_TEST_" + System.currentTimeMillis();
        CreatePermissionRequest createReq = new CreatePermissionRequest();
        createReq.setName(uniquePerm);
        createReq.setDescription("Automated test permission");
        createReq.setCategory("TEST");

        MvcResult createResult = mockMvc.perform(post("/permissions")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();

        JsonNode root = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long createdId = root.path("data").path("id").asLong();

        // Update
        PermissionDto updateDto = new PermissionDto();
        updateDto.setName(uniquePerm + "_UPDATED");
        updateDto.setDescription("Updated description");
        updateDto.setCategory("TEST");

        mockMvc.perform(put("/permissions/" + createdId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Delete
        mockMvc.perform(delete("/permissions/" + createdId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Integration: GET /users/me - Should return 200 OK with admin profile")
    void testGetCurrentUserIntegration() throws Exception {
        mockMvc.perform(get("/users/me")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("admin@medistock.com"));
    }

    @Test
    @DisplayName("Integration: GET /users - Should return 200 OK with all users")
    void testGetAllUsersIntegration() throws Exception {
        mockMvc.perform(get("/users")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Integration: GET /users/role/ROLE_ADMIN - Should return 200 OK")
    void testGetUsersByRoleIntegration() throws Exception {
        mockMvc.perform(get("/users/role/ROLE_ADMIN")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Integration: PUT /users/profile - Should update profile and return 200 OK")
    void testUpdateProfileIntegration() throws Exception {
        UserResponseDto profileUpdate = new UserResponseDto();
        profileUpdate.setFirstName("System");
        profileUpdate.setLastName("Administrator");

        mockMvc.perform(put("/users/profile")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
