package com.medistock.repository;

import com.medistock.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT r FROM Role r WHERE r.deleted = false")
    List<Role> findAllActive();

    @Query("SELECT r FROM Role r WHERE r.name = :name AND r.deleted = false")
    Optional<Role> findActiveByName(@Param("name") String name);

    @Query("SELECT r FROM Role r JOIN r.permissions p WHERE p.name = :permissionName AND r.deleted = false")
    List<Role> findByPermissionName(@Param("permissionName") String permissionName);
}
