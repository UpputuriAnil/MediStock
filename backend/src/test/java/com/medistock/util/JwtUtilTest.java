package com.medistock.util;

import com.medistock.entity.Permission;
import com.medistock.entity.Role;
import com.medistock.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    private static final String SECRET = "MediStockSuperSecretKeyForJWTTokenGenerationMustBeAtLeast256BitsLongForHS256AlgorithmSecurity";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "accessTokenExpiration", 900000L); // 15 mins
        ReflectionTestUtils.setField(jwtUtil, "refreshTokenExpiration", 604800000L); // 7 days
        ReflectionTestUtils.setField(jwtUtil, "jwtIssuer", "medistock");
        ReflectionTestUtils.setField(jwtUtil, "jwtAudience", "medistock-users");
    }

    @Test
    void testGenerateAccessTokenAndExtractClaims() {
        User user = new User();
        user.setId(100L);
        user.setEmail("admin@medistock.com");
        user.setFirstName("Admin");
        user.setLastName("User");

        Role role = new Role();
        role.setId(1L);
        role.setName("ROLE_ADMIN");

        Permission perm = new Permission();
        perm.setId(1L);
        perm.setName("MEDICINE_READ");

        Set<Permission> permissions = new HashSet<>();
        permissions.add(perm);
        role.setPermissions(permissions);

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        String token = jwtUtil.generateAccessToken(user);

        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("admin@medistock.com", jwtUtil.getEmailFromToken(token));
        assertEquals(100L, jwtUtil.getUserIdFromToken(token));
        assertFalse(jwtUtil.isTokenExpired(token));

        List<String> tokenRoles = jwtUtil.getRolesFromToken(token);
        assertNotNull(tokenRoles);
        assertTrue(tokenRoles.contains("ROLE_ADMIN"));

        List<String> tokenPermissions = jwtUtil.getPermissionsFromToken(token);
        assertNotNull(tokenPermissions);
        assertTrue(tokenPermissions.contains("MEDICINE_READ"));
    }

    @Test
    void testGenerateRefreshToken() {
        User user = new User();
        user.setId(200L);
        user.setEmail("staff@medistock.com");

        String refreshToken = jwtUtil.generateRefreshToken(user);

        assertNotNull(refreshToken);
        assertTrue(jwtUtil.validateToken(refreshToken));
        assertEquals("staff@medistock.com", jwtUtil.getEmailFromToken(refreshToken));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtUtil.validateToken("invalid.jwt.token"));
    }

    @Test
    void testGenerateTokenFromEmail() {
        String token = jwtUtil.generateTokenFromEmail("test@medistock.com");
        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("test@medistock.com", jwtUtil.getEmailFromToken(token));
    }

    @Test
    void testNullRolePermissionsHandling() {
        User user = new User();
        user.setId(300L);
        user.setEmail("pharmacist@medistock.com");
        user.setFirstName("John");
        user.setLastName("Doe");

        Role roleWithoutPermissions = new Role();
        roleWithoutPermissions.setId(2L);
        roleWithoutPermissions.setName("ROLE_PHARMACIST");
        roleWithoutPermissions.setPermissions(null); // Explicitly null permissions

        Set<Role> roles = new HashSet<>();
        roles.add(roleWithoutPermissions);
        user.setRoles(roles);

        assertDoesNotThrow(() -> {
            String token = jwtUtil.generateAccessToken(user);
            assertNotNull(token);
            assertTrue(jwtUtil.validateToken(token));
        });
    }
}
