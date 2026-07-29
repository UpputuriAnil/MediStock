package com.medistock.user;

import com.medistock.dto.*;

import java.util.List;

public interface UserService {

    UserResponseDto getUserById(Long id);

    UserResponseDto getCurrentUser();

    List<UserResponseDto> getAllUsers();

    List<UserResponseDto> getUsersByRole(String roleName);

    UserResponseDto updateUser(Long id, UserResponseDto userDto);

    void deleteUser(Long id);

    void assignRolesToUser(AssignRoleRequest request);

    void removeRolesFromUser(Long userId, List<Long> roleIds);

    void enableUser(Long id);

    void disableUser(Long id);
}
