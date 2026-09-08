package com.medistock.controller;

import com.medistock.dto.CreatePermissionRequest;
import com.medistock.dto.PermissionDto;
import com.medistock.permission.PermissionService;
import com.medistock.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@Tag(name = "Permission Management", description = "Permission management APIs")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_CREATE', 'PERMISSION_CREATE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Create a new permission")
    public ResponseEntity<ApiResponse<PermissionDto>> createPermission(@Valid @RequestBody CreatePermissionRequest request) {
        PermissionDto response = permissionService.createPermission(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Permission created successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_READ', 'PERMISSION_READ', 'ROLE_ADMIN', 'ADMIN') or isAuthenticated()")
    @Operation(summary = "Get permission by ID")
    public ResponseEntity<ApiResponse<PermissionDto>> getPermissionById(@PathVariable Long id) {
        PermissionDto response = permissionService.getPermissionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/name/{name}")
    @PreAuthorize("hasAnyAuthority('ROLE_READ', 'PERMISSION_READ', 'ROLE_ADMIN', 'ADMIN') or isAuthenticated()")
    @Operation(summary = "Get permission by name")
    public ResponseEntity<ApiResponse<PermissionDto>> getPermissionByName(@PathVariable String name) {
        PermissionDto response = permissionService.getPermissionByName(name);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_READ', 'PERMISSION_READ', 'ROLE_ADMIN', 'ADMIN') or isAuthenticated()")
    @Operation(summary = "Get all permissions")
    public ResponseEntity<ApiResponse<List<PermissionDto>>> getAllPermissions() {
        List<PermissionDto> response = permissionService.getAllPermissions();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("hasAnyAuthority('ROLE_READ', 'PERMISSION_READ', 'ROLE_ADMIN', 'ADMIN') or isAuthenticated()")
    @Operation(summary = "Get permissions by category")
    public ResponseEntity<ApiResponse<List<PermissionDto>>> getPermissionsByCategory(@PathVariable String category) {
        List<PermissionDto> response = permissionService.getPermissionsByCategory(category);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_UPDATE', 'PERMISSION_UPDATE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Update permission")
    public ResponseEntity<ApiResponse<PermissionDto>> updatePermission(
            @PathVariable Long id,
            @RequestBody PermissionDto permissionDto) {
        PermissionDto response = permissionService.updatePermission(id, permissionDto);
        return ResponseEntity.ok(ApiResponse.success("Permission updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_DELETE', 'PERMISSION_DELETE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Delete permission")
    public ResponseEntity<ApiResponse<Void>> deletePermission(@PathVariable Long id) {
        permissionService.deletePermission(id);
        return ResponseEntity.ok(ApiResponse.success("Permission deleted successfully"));
    }
}
