package com.medistock.user.impl;

import com.medistock.dto.AssignRoleRequest;
import com.medistock.dto.RoleDto;
import com.medistock.dto.UserResponseDto;
import com.medistock.entity.Role;
import com.medistock.entity.User;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.mapper.UserMapper;
import com.medistock.repository.RefreshTokenRepository;
import com.medistock.repository.RoleRepository;
import com.medistock.repository.UserRepository;
import com.medistock.user.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, UserMapper userMapper,
            PasswordEncoder passwordEncoder, RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toDto(user);
    }

    @Override
    public UserResponseDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findActiveByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return userMapper.toDto(user);
    }

    @Override
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAllActiveUsers()
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDto> getUsersByRole(String roleName) {
        return userRepository.findByRoleName(roleName)
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponseDto updateUser(Long id, UserResponseDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        userMapper.updateEntityFromDto(userDto, user);
        user = userRepository.save(user);
        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Soft delete
        user.setDeleted(true);
        user.setDeletedAt(java.time.LocalDateTime.now());
        user.setEnabled(false);
        userRepository.save(user);

        // Revoke all refresh tokens
        refreshTokenRepository.deleteAllByUser(user);
    }

    @Override
    @Transactional
    public void assignRolesToUser(AssignRoleRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        Set<Role> roles = roleRepository.findAllById(request.getRoleIds())
                .stream()
                .collect(Collectors.toSet());

        user.setRoles(roles);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void removeRolesFromUser(Long userId, List<Long> roleIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Set<Role> rolesToRemove = roleRepository.findAllById(roleIds)
                .stream()
                .collect(Collectors.toSet());

        user.getRoles().removeAll(rolesToRemove);

        if (user.getRoles().isEmpty()) {
            throw new BadRequestException("User must have at least one role");
        }

        userRepository.save(user);
    }

    @Override
    @Transactional
    public void enableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setEnabled(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void disableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setEnabled(false);
        userRepository.save(user);

        // Revoke all refresh tokens
        refreshTokenRepository.deleteAllByUser(user);
    }
}
