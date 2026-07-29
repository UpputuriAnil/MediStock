package com.medistock.repository;

import com.medistock.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT p FROM Permission p WHERE p.deleted = false")
    List<Permission> findAllActive();

    @Query("SELECT p FROM Permission p WHERE p.name = :name AND p.deleted = false")
    Optional<Permission> findActiveByName(@Param("name") String name);

    @Query("SELECT p FROM Permission p WHERE p.category = :category AND p.deleted = false")
    List<Permission> findByCategory(@Param("category") String category);

    List<Permission> findByNameIn(List<String> names);
}
