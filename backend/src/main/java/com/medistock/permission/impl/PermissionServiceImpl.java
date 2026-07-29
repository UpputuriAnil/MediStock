package com.medistock.permission.impl;

import com.medistock.dto.CreatePermissionRequest;
import com.medistock.dto.PermissionDto;
import com.medistock.entity.Permission;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.mapper.PermissionMapper;
import com.medistock.permission.PermissionService;
import com.medistock.repository.PermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;

    public PermissionServiceImpl(PermissionRepository permissionRepository, PermissionMapper permissionMapper) {
        this.permissionRepository = permissionRepository;
        this.permissionMapper = permissionMapper;
    }

    @Override
    @Transactional
    public PermissionDto createPermission(CreatePermissionRequest request) {
        if (permissionRepository.existsByName(request.getName())) {
            throw new BadRequestException("Permission with name " + request.getName() + " already exists");
        }

        Permission permission = permissionMapper.toEntity(request);
        permission = permissionRepository.save(permission);
        return permissionMapper.toDto(permission);
    }

    @Override
    public PermissionDto getPermissionById(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));
        return permissionMapper.toDto(permission);
    }

    @Override
    public PermissionDto getPermissionByName(String name) {
        Permission permission = permissionRepository.findActiveByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "name", name));
        return permissionMapper.toDto(permission);
    }

    @Override
    public List<PermissionDto> getAllPermissions() {
        return permissionRepository.findAllActive()
                .stream()
                .map(permissionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PermissionDto> getPermissionsByCategory(String category) {
        return permissionRepository.findByCategory(category)
                .stream()
                .map(permissionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PermissionDto updatePermission(Long id, PermissionDto permissionDto) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));

        permissionMapper.updateEntityFromDto(permissionDto, permission);
        permission = permissionRepository.save(permission);
        return permissionMapper.toDto(permission);
    }

    @Override
    @Transactional
    public void deletePermission(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));

        if (!permission.getRoles().isEmpty()) {
            throw new BadRequestException("Cannot delete permission assigned to roles");
        }

        permission.setDeleted(true);
        permission.setDeletedAt(java.time.LocalDateTime.now());
        permissionRepository.save(permission);
    }
}
