package com.medistock.role;

import com.medistock.dto.*;

import java.util.List;

public interface RoleService {

    RoleDto createRole(CreateRoleRequest request);

    RoleDto getRoleById(Long id);

    RoleDto getRoleByName(String name);

    List<RoleDto> getAllRoles();

    RoleDto updateRole(Long id, UpdateRoleRequest request);

    void deleteRole(Long id);

    void assignPermissionsToRole(AssignPermissionRequest request);

    void removePermissionsFromRole(Long roleId, List<Long> permissionIds);
}
