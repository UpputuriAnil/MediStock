package com.medistock.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public class AssignPermissionRequest {

    @NotNull(message = "Role ID is required")
    private Long roleId;

    @NotEmpty(message = "At least one permission must be assigned")
    private Set<Long> permissionIds;

    public AssignPermissionRequest() {
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public Set<Long> getPermissionIds() {
        return permissionIds;
    }

    public void setPermissionIds(Set<Long> permissionIds) {
        this.permissionIds = permissionIds;
    }
}
