package com.medistock.permission;

import com.medistock.dto.*;

import java.util.List;

public interface PermissionService {

    PermissionDto createPermission(CreatePermissionRequest request);

    PermissionDto getPermissionById(Long id);

    PermissionDto getPermissionByName(String name);

    List<PermissionDto> getAllPermissions();

    List<PermissionDto> getPermissionsByCategory(String category);

    PermissionDto updatePermission(Long id, PermissionDto permissionDto);

    void deletePermission(Long id);
}
