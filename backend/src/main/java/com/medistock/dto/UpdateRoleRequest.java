package com.medistock.dto;

import jakarta.validation.constraints.Size;

import java.util.Set;

public class UpdateRoleRequest {

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    private Set<Long> permissionIds;

    public UpdateRoleRequest() {
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Long> getPermissionIds() {
        return permissionIds;
    }

    public void setPermissionIds(Set<Long> permissionIds) {
        this.permissionIds = permissionIds;
    }
}
