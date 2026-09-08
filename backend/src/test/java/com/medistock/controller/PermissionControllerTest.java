package com.medistock.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.dto.CreatePermissionRequest;
import com.medistock.dto.PermissionDto;
import com.medistock.permission.PermissionService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PermissionControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private PermissionService permissionService;

    private PermissionDto mockPermissionDto;

    @BeforeEach
    void setUp() {
        PermissionController permissionController = new PermissionController(permissionService);
        mockMvc = MockMvcBuilders.standaloneSetup(permissionController).build();

        mockPermissionDto = new PermissionDto(1L, "USER_READ", "View user info", "USER");
    }

    @Test
    @DisplayName("GET /permissions - Should return all permissions")
    void testGetAllPermissions() throws Exception {
        when(permissionService.getAllPermissions()).thenReturn(List.of(mockPermissionDto));

        mockMvc.perform(get("/permissions")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("USER_READ"));
    }

    @Test
    @DisplayName("GET /permissions/{id} - Should return permission by ID")
    void testGetPermissionById() throws Exception {
        when(permissionService.getPermissionById(1L)).thenReturn(mockPermissionDto);

        mockMvc.perform(get("/permissions/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("USER_READ"));
    }

    @Test
    @DisplayName("GET /permissions/name/{name} - Should return permission by name")
    void testGetPermissionByName() throws Exception {
        when(permissionService.getPermissionByName("USER_READ")).thenReturn(mockPermissionDto);

        mockMvc.perform(get("/permissions/name/USER_READ")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("USER_READ"));
    }

    @Test
    @DisplayName("GET /permissions/category/{category} - Should return permissions by category")
    void testGetPermissionsByCategory() throws Exception {
        when(permissionService.getPermissionsByCategory("USER")).thenReturn(List.of(mockPermissionDto));

        mockMvc.perform(get("/permissions/category/USER")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].category").value("USER"));
    }

    @Test
    @DisplayName("POST /permissions - Should create new permission")
    void testCreatePermission() throws Exception {
        CreatePermissionRequest request = new CreatePermissionRequest();
        request.setName("AUDIT_LOG_READ");
        request.setDescription("Read audit logs");
        request.setCategory("AUDIT");

        PermissionDto createdDto = new PermissionDto(2L, "AUDIT_LOG_READ", "Read audit logs", "AUDIT");
        when(permissionService.createPermission(any(CreatePermissionRequest.class))).thenReturn(createdDto);

        mockMvc.perform(post("/permissions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("AUDIT_LOG_READ"));
    }

    @Test
    @DisplayName("PUT /permissions/{id} - Should update permission")
    void testUpdatePermission() throws Exception {
        PermissionDto updateDto = new PermissionDto(1L, "USER_READ_UPDATED", "Updated description", "USER");
        when(permissionService.updatePermission(eq(1L), any(PermissionDto.class))).thenReturn(updateDto);

        mockMvc.perform(put("/permissions/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("USER_READ_UPDATED"));
    }

    @Test
    @DisplayName("DELETE /permissions/{id} - Should delete permission")
    void testDeletePermission() throws Exception {
        doNothing().when(permissionService).deletePermission(1L);

        mockMvc.perform(delete("/permissions/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
