package com.medistock.controller;

import com.medistock.dto.*;
import com.medistock.response.ApiResponse;
import com.medistock.role.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@Tag(name = "Role Management", description = "Role management APIs")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_CREATE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Create a new role")
    public ResponseEntity<ApiResponse<RoleDto>> createRole(@Valid @RequestBody CreateRoleRequest request) {
        RoleDto response = roleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Role created successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_READ', 'ROLE_ADMIN', 'ADMIN') or isAuthenticated()")
    @Operation(summary = "Get role by ID")
    public ResponseEntity<ApiResponse<RoleDto>> getRoleById(@PathVariable Long id) {
        RoleDto response = roleService.getRoleById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/name/{name}")
    @PreAuthorize("hasAnyAuthority('ROLE_READ', 'ROLE_ADMIN', 'ADMIN') or isAuthenticated()")
    @Operation(summary = "Get role by name")
    public ResponseEntity<ApiResponse<RoleDto>> getRoleByName(@PathVariable String name) {
        RoleDto response = roleService.getRoleByName(name);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_READ', 'ROLE_ADMIN', 'ADMIN') or isAuthenticated()")
    @Operation(summary = "Get all roles")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getAllRoles() {
        List<RoleDto> response = roleService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_UPDATE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Update role")
    public ResponseEntity<ApiResponse<RoleDto>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        RoleDto response = roleService.updateRole(id, request);
        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_DELETE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Delete role")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.success("Role deleted successfully"));
    }

    @PostMapping("/assign-permissions")
    @PreAuthorize("hasAnyAuthority('ROLE_UPDATE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Assign permissions to role")
    public ResponseEntity<ApiResponse<Void>> assignPermissionsToRole(
            @Valid @RequestBody AssignPermissionRequest request) {
        roleService.assignPermissionsToRole(request);
        return ResponseEntity.ok(ApiResponse.success("Permissions assigned to role successfully"));
    }

    @DeleteMapping("/{roleId}/permissions")
    @PreAuthorize("hasAnyAuthority('ROLE_UPDATE', 'ROLE_ADMIN', 'ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Remove permissions from role")
    public ResponseEntity<ApiResponse<Void>> removePermissionsFromRole(
            @PathVariable Long roleId,
            @RequestBody List<Long> permissionIds) {
        roleService.removePermissionsFromRole(roleId, permissionIds);
        return ResponseEntity.ok(ApiResponse.success("Permissions removed from role successfully"));
    }
}
