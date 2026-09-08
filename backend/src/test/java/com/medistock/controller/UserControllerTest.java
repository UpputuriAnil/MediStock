package com.medistock.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.dto.AssignRoleRequest;
import com.medistock.dto.RoleDto;
import com.medistock.dto.UserResponseDto;
import com.medistock.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private UserService userService;

    private UserResponseDto mockUserDto;

    @BeforeEach
    void setUp() {
        UserController userController = new UserController(userService);
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();

        RoleDto adminRole = new RoleDto();
        adminRole.setId(1L);
        adminRole.setName("ROLE_ADMIN");
        adminRole.setDescription("Administrator");

        mockUserDto = new UserResponseDto();
        mockUserDto.setId(1L);
        mockUserDto.setEmail("admin@medistock.com");
        mockUserDto.setFirstName("System");
        mockUserDto.setLastName("Admin");
        mockUserDto.setPhoneNumber("+1234567890");
        mockUserDto.setEnabled(true);
        mockUserDto.setEmailVerified(true);
        mockUserDto.setRoles(Set.of(adminRole));
    }

    @Test
    @DisplayName("GET /users/me - Should return current user profile")
    void testGetCurrentUser() throws Exception {
        when(userService.getCurrentUser()).thenReturn(mockUserDto);

        mockMvc.perform(get("/users/me")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("admin@medistock.com"));
    }

    @Test
    @DisplayName("GET /users/{id} - Should return user by ID")
    void testGetUserById() throws Exception {
        when(userService.getUserById(1L)).thenReturn(mockUserDto);

        mockMvc.perform(get("/users/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("admin@medistock.com"));
    }

    @Test
    @DisplayName("GET /users - Should return all users")
    void testGetAllUsers() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of(mockUserDto));

        mockMvc.perform(get("/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].email").value("admin@medistock.com"));
    }

    @Test
    @DisplayName("GET /users/role/{roleName} - Should return users by role")
    void testGetUsersByRole() throws Exception {
        when(userService.getUsersByRole("ROLE_ADMIN")).thenReturn(List.of(mockUserDto));

        mockMvc.perform(get("/users/role/ROLE_ADMIN")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].email").value("admin@medistock.com"));
    }

    @Test
    @DisplayName("PUT /users/{id} - Should update user")
    void testUpdateUser() throws Exception {
        UserResponseDto updateDto = new UserResponseDto();
        updateDto.setFirstName("UpdatedFirstName");
        updateDto.setLastName("UpdatedLastName");

        when(userService.updateUser(eq(1L), any(UserResponseDto.class))).thenReturn(mockUserDto);

        mockMvc.perform(put("/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("PUT /users/profile - Should update profile")
    void testUpdateProfile() throws Exception {
        UserResponseDto profileDto = new UserResponseDto();
        profileDto.setFirstName("UpdatedProfileName");

        when(userService.updateProfile(any(UserResponseDto.class))).thenReturn(mockUserDto);

        mockMvc.perform(put("/users/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(profileDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("DELETE /users/{id} - Should delete user")
    void testDeleteUser() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/users/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /users/assign-roles - Should assign roles to user")
    void testAssignRolesToUser() throws Exception {
        AssignRoleRequest request = new AssignRoleRequest();
        request.setUserId(1L);
        request.setRoleIds(Set.of(1L, 2L));

        doNothing().when(userService).assignRolesToUser(any(AssignRoleRequest.class));

        mockMvc.perform(post("/users/assign-roles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("DELETE /users/{userId}/roles - Should remove roles from user")
    void testRemoveRolesFromUser() throws Exception {
        doNothing().when(userService).removeRolesFromUser(eq(1L), any());

        mockMvc.perform(delete("/users/1/roles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(List.of(2L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("PUT /users/{id}/enable - Should enable user")
    void testEnableUser() throws Exception {
        doNothing().when(userService).enableUser(1L);

        mockMvc.perform(put("/users/1/enable")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("PUT /users/{id}/disable - Should disable user")
    void testDisableUser() throws Exception {
        doNothing().when(userService).disableUser(1L);

        mockMvc.perform(put("/users/1/disable")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
