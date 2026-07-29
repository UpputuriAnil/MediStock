package com.medistock.mapper;

import com.medistock.dto.UserResponseDto;
import com.medistock.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", source = "roles", qualifiedByName = "roleSetToRoleDtoSet")
    UserResponseDto toDto(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntityFromDto(UserResponseDto dto, @MappingTarget User user);

    @Named("roleSetToRoleDtoSet")
    default Set<com.medistock.dto.RoleDto> roleSetToRoleDtoSet(Set<com.medistock.entity.Role> roles) {
        if (roles == null) return null;
        Set<com.medistock.dto.RoleDto> dtoSet = new java.util.HashSet<>();
        for (com.medistock.entity.Role role : roles) {
            com.medistock.dto.RoleDto dto = new com.medistock.dto.RoleDto();
            dto.setId(role.getId());
            dto.setName(role.getName());
            dto.setDescription(role.getDescription());
            dtoSet.add(dto);
        }
        return dtoSet;
    }
}
