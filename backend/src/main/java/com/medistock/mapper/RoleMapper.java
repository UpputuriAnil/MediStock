package com.medistock.mapper;

import com.medistock.dto.CreateRoleRequest;
import com.medistock.dto.RoleDto;
import com.medistock.dto.UpdateRoleRequest;
import com.medistock.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "permissions", source = "permissions", qualifiedByName = "permissionSetToPermissionDtoSet")
    RoleDto toDto(Role role);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "users", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    Role toEntity(CreateRoleRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "name", ignore = true)
    @Mapping(target = "users", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntityFromDto(UpdateRoleRequest request, @MappingTarget Role role);

    @Named("permissionSetToPermissionDtoSet")
    default Set<com.medistock.dto.PermissionDto> permissionSetToPermissionDtoSet(Set<com.medistock.entity.Permission> permissions) {
        if (permissions == null) return null;
        Set<com.medistock.dto.PermissionDto> dtoSet = new java.util.HashSet<>();
        for (com.medistock.entity.Permission permission : permissions) {
            com.medistock.dto.PermissionDto dto = new com.medistock.dto.PermissionDto();
            dto.setId(permission.getId());
            dto.setName(permission.getName());
            dto.setDescription(permission.getDescription());
            dto.setCategory(permission.getCategory());
            dtoSet.add(dto);
        }
        return dtoSet;
    }
}
