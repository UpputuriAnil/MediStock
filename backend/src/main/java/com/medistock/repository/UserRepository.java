package com.medistock.repository;

import com.medistock.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.deleted = false")
    List<User> findAllActiveUsers();

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deleted = false")
    Optional<User> findActiveByEmail(@Param("email") String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.deleted = false")
    List<User> findByRoleName(@Param("roleName") String roleName);

    @Query("SELECT u FROM User u WHERE u.oauthProvider = :provider AND u.oauthProviderId = :providerId AND u.deleted = false")
    Optional<User> findByOAuthProviderAndProviderId(@Param("provider") String provider, @Param("providerId") String providerId);

    @Query("SELECT u FROM User u WHERE u.emailVerified = false AND u.deleted = false")
    List<User> findUnverifiedUsers();
}
