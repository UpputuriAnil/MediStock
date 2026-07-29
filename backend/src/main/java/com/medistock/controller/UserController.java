package com.medistock.controller;

import com.medistock.dto.AssignRoleRequest;
import com.medistock.dto.UserResponseDto;
import com.medistock.response.ApiResponse;
import com.medistock.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@Tag(name = "User Management", description = "User management APIs")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user")
    public ResponseEntity<ApiResponse<UserResponseDto>> getCurrentUser() {
        UserResponseDto response = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_READ')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserById(@PathVariable Long id) {
        UserResponseDto response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ')")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAllUsers() {
        List<UserResponseDto> response = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/role/{roleName}")
    @PreAuthorize("hasAuthority('USER_READ')")
    @Operation(summary = "Get users by role")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getUsersByRole(@PathVariable String roleName) {
        List<UserResponseDto> response = userService.getUsersByRole(roleName);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Operation(summary = "Update user")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserResponseDto userDto) {
        UserResponseDto response = userService.updateUser(id, userDto);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    @Operation(summary = "Delete user")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    @PostMapping("/assign-roles")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Operation(summary = "Assign roles to user")
    public ResponseEntity<ApiResponse<Void>> assignRolesToUser(@Valid @RequestBody AssignRoleRequest request) {
        userService.assignRolesToUser(request);
        return ResponseEntity.ok(ApiResponse.success("Roles assigned to user successfully"));
    }

    @DeleteMapping("/{userId}/roles")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Operation(summary = "Remove roles from user")
    public ResponseEntity<ApiResponse<Void>> removeRolesFromUser(
            @PathVariable Long userId,
            @RequestBody List<Long> roleIds) {
        userService.removeRolesFromUser(userId, roleIds);
        return ResponseEntity.ok(ApiResponse.success("Roles removed from user successfully"));
    }

    @PutMapping("/{id}/enable")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Operation(summary = "Enable user")
    public ResponseEntity<ApiResponse<Void>> enableUser(@PathVariable Long id) {
        userService.enableUser(id);
        return ResponseEntity.ok(ApiResponse.success("User enabled successfully"));
    }

    @PutMapping("/{id}/disable")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Operation(summary = "Disable user")
    public ResponseEntity<ApiResponse<Void>> disableUser(@PathVariable Long id) {
        userService.disableUser(id);
        return ResponseEntity.ok(ApiResponse.success("User disabled successfully"));
    }
}
