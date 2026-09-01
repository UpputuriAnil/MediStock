package com.medistock.auth.impl;

import com.medistock.auth.AuthService;
import com.medistock.constants.SecurityConstants;
import com.medistock.dto.*;
import com.medistock.entity.*;
import com.medistock.exception.*;
import com.medistock.repository.*;
import com.medistock.util.JwtUtil;
import com.medistock.validation.PasswordValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordValidator passwordValidator;

    @Value("${app.security.email-verification.enabled}")
    private boolean emailVerificationEnabled;

    @Value("${app.security.email-verification.token-expiration}")
    private long emailVerificationTokenExpiration;

    @Value("${app.security.password-reset.token-expiration}")
    private long passwordResetTokenExpiration;

    public AuthServiceImpl(UserRepository userRepository, RoleRepository roleRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            EmailVerificationTokenRepository emailVerificationTokenRepository,
            PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
            AuthenticationManager authenticationManager,
            PasswordValidator passwordValidator) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.passwordValidator = passwordValidator;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate password
        if (!passwordValidator.isValid(request.getPassword())) {
            throw new BadRequestException(passwordValidator.getValidationMessage());
        }

        // Validate password match
        if (!passwordValidator.passwordsMatch(request.getPassword(), request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User with email " + request.getEmail() + " already exists");
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setEnabled(true);
        user.setEmailVerified(false);
        user.setAccountNonExpired(true);
        user.setAccountNonLocked(true);
        user.setCredentialsNonExpired(true);
        user.setRoles(new HashSet<>());

        // Assign role based on user selection or default to STAFF
        String targetRoleName = SecurityConstants.ROLE_STAFF;
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            String roleInput = request.getRole().trim().toUpperCase();
            if (roleInput.contains("ADMIN")) {
                targetRoleName = SecurityConstants.ROLE_ADMIN;
            } else if (roleInput.contains("PHARM")) {
                targetRoleName = SecurityConstants.ROLE_PHARMACIST;
            } else if (roleInput.contains("STAFF")) {
                targetRoleName = SecurityConstants.ROLE_STAFF;
            } else if (roleInput.startsWith("ROLE_")) {
                targetRoleName = roleInput;
            } else {
                targetRoleName = "ROLE_" + roleInput;
            }
        }

        final String selectedRoleName = targetRoleName;
        Role assignedRole = roleRepository.findByName(selectedRoleName)
                .map(existingRole -> {
                    if (Boolean.TRUE.equals(existingRole.getDeleted())) {
                        existingRole.setDeleted(false);
                        existingRole.setDeletedAt(null);
                        return roleRepository.save(existingRole);
                    }
                    return existingRole;
                })
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(selectedRoleName);
                    newRole.setDescription(selectedRoleName.replace("ROLE_", "") + " Role");
                    newRole.setDeleted(false);
                    return roleRepository.save(newRole);
                });
        user.getRoles().add(assignedRole);

        // Save user
        user = userRepository.save(user);

        // Create email verification token if enabled
        if (emailVerificationEnabled) {
            String verificationToken = generateToken();
            EmailVerificationToken emailToken = new EmailVerificationToken();
            emailToken.setToken(verificationToken);
            emailToken.setUser(user);
            emailToken.setExpiryDate(LocalDateTime.now().plus(Duration.ofMillis(emailVerificationTokenExpiration)));
            emailVerificationTokenRepository.save(emailToken);

            // TODO: Send verification email
            System.out.println("Email verification token: " + verificationToken);
        }

        // Generate tokens
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), user.getPassword());
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        // Save refresh token
        saveRefreshToken(user, refreshToken);

        // Build response
        return buildAuthResponse(accessToken, refreshToken, user);
    }

    @Override
    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        String email = request.getEmail();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

            String[] nameParts = (request.getName() != null ? request.getName() : "Google User").split(" ", 2);
            user.setFirstName(nameParts[0]);
            user.setLastName(nameParts.length > 1 ? nameParts[1] : "");
            user.setEnabled(true);
            user.setEmailVerified(true);
            user.setOauthProvider("GOOGLE");
            user.setOauthProviderId(request.getGoogleId());
            user.setProfilePictureUrl(request.getAvatar());
            user.setAccountNonExpired(true);
            user.setAccountNonLocked(true);
            user.setCredentialsNonExpired(true);
            user.setRoles(new HashSet<>());

            String targetRoleName = SecurityConstants.ROLE_STAFF;
            if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
                String roleInput = request.getRole().trim().toUpperCase();
                if (roleInput.contains("ADMIN")) {
                    targetRoleName = SecurityConstants.ROLE_ADMIN;
                } else if (roleInput.contains("PHARM")) {
                    targetRoleName = SecurityConstants.ROLE_PHARMACIST;
                } else if (roleInput.contains("STAFF")) {
                    targetRoleName = SecurityConstants.ROLE_STAFF;
                } else if (roleInput.startsWith("ROLE_")) {
                    targetRoleName = roleInput;
                } else {
                    targetRoleName = "ROLE_" + roleInput;
                }
            }

            final String selectedRoleName = targetRoleName;
            Role defaultRole = roleRepository.findByName(selectedRoleName)
                    .map(existingRole -> {
                        if (Boolean.TRUE.equals(existingRole.getDeleted())) {
                            existingRole.setDeleted(false);
                            existingRole.setDeletedAt(null);
                            return roleRepository.save(existingRole);
                        }
                        return existingRole;
                    })
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setName(selectedRoleName);
                        newRole.setDescription(selectedRoleName.replace("ROLE_", "") + " Role");
                        newRole.setDeleted(false);
                        return roleRepository.save(newRole);
                    });

            user.getRoles().add(defaultRole);
            user = userRepository.save(user);
        }

        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        saveRefreshToken(user, refreshToken);

        return buildAuthResponse(accessToken, refreshToken, user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));

            User user = userRepository.findActiveByEmail(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

            // Generate tokens
            String accessToken = jwtUtil.generateAccessToken(user);
            String refreshToken = jwtUtil.generateRefreshToken(user);

            // Revoke old refresh tokens
            revokeOldRefreshTokens(user);

            // Save refresh token
            saveRefreshToken(user, refreshToken);

            return buildAuthResponse(accessToken, refreshToken, user);
        } catch (Exception e) {
            System.err.println("Error during login: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    @Transactional
    public void logout(String token) {
        if (token != null && token.startsWith(SecurityConstants.JWT_PREFIX)) {
            token = token.substring(SecurityConstants.JWT_PREFIX.length());
        }

        if (token == null || token.trim().isEmpty()) {
            return;
        }

        // 1. Try finding and revoking as a refresh token
        Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository.findByToken(token);
        if (refreshTokenOpt.isPresent()) {
            RefreshToken refreshToken = refreshTokenOpt.get();
            refreshToken.setRevoked(true);
            refreshToken.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(refreshToken);
            return;
        }

        // 2. If an Access Token (JWT) was passed, extract user and revoke all active refresh tokens for the user
        try {
            if (jwtUtil.validateToken(token)) {
                String email = jwtUtil.getEmailFromToken(token);
                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    revokeOldRefreshTokens(user);
                }
            }
        } catch (Exception e) {
            // Ignore token parse errors on logout
        }
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtUtil.validateToken(refreshToken)) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        RefreshToken tokenEntity = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new InvalidTokenException("Refresh token not found"));

        if (tokenEntity.getRevoked() || tokenEntity.isExpired()) {
            throw new TokenExpiredException("Refresh token is expired or revoked");
        }

        User user = tokenEntity.getUser();

        if (!user.getEnabled()) {
            throw new UnauthorizedException("User account is disabled");
        }

        // Generate new tokens
        String newAccessToken = jwtUtil.generateAccessToken(user);
        String newRefreshToken = jwtUtil.generateRefreshToken(user);

        // Save new refresh token
        saveRefreshToken(user, newRefreshToken);

        // Revoke old refresh token
        tokenEntity.setRevoked(true);
        tokenEntity.setRevokedAt(LocalDateTime.now());
        tokenEntity.setReplacedByToken(newRefreshToken);
        refreshTokenRepository.save(tokenEntity);

        return buildAuthResponse(newAccessToken, newRefreshToken, user);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Delete existing password reset token if any
        passwordResetTokenRepository.deleteByUser(user);

        // Generate new token
        String resetToken = generateToken();
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(resetToken);
        passwordResetToken.setUser(user);
        passwordResetToken.setExpiryDate(LocalDateTime.now().plus(Duration.ofMillis(passwordResetTokenExpiration)));

        passwordResetTokenRepository.save(passwordResetToken);

        // TODO: Send password reset email
        System.out.println("Password reset token: " + resetToken);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Validate password
        if (!passwordValidator.isValid(request.getPassword())) {
            throw new BadRequestException(passwordValidator.getValidationMessage());
        }

        // Validate password match
        if (!passwordValidator.passwordsMatch(request.getPassword(), request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid password reset token"));

        if (resetToken.getUsed() || resetToken.isExpired()) {
            throw new TokenExpiredException("Password reset token is expired or already used");
        }

        User user = resetToken.getUser();

        // Update password
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        // Revoke all refresh tokens for security
        refreshTokenRepository.deleteAllByUser(user);
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid email verification token"));

        if (verificationToken.getVerified() || verificationToken.isExpired()) {
            throw new TokenExpiredException("Email verification token is expired or already used");
        }

        User user = verificationToken.getUser();

        // Mark email as verified
        user.setEmailVerified(true);
        userRepository.save(user);

        // Mark token as verified
        verificationToken.setVerified(true);
        verificationToken.setVerifiedAt(LocalDateTime.now());
        emailVerificationTokenRepository.save(verificationToken);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse.UserDto getCurrentUser(String token) {
        if (token != null && token.startsWith(SecurityConstants.JWT_PREFIX)) {
            token = token.substring(SecurityConstants.JWT_PREFIX.length());
        }

        if (!jwtUtil.validateToken(token)) {
            throw new InvalidTokenException("Invalid or expired JWT token");
        }

        String email = jwtUtil.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(java.util.stream.Collectors.toSet());

        Set<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions() != null ? role.getPermissions().stream() : java.util.stream.Stream.empty())
                .map(permission -> permission.getName())
                .collect(java.util.stream.Collectors.toSet());

        return new AuthResponse.UserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getEmailVerified(),
                roles,
                permissions
        );
    }

    private void saveRefreshToken(User user, String token) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(token);
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(LocalDateTime.now().plus(Duration.ofMillis(jwtUtil.getRefreshTokenExpiration())));
        refreshToken.setRevoked(false);
        refreshTokenRepository.save(refreshToken);
    }

    private void revokeOldRefreshTokens(User user) {
        refreshTokenRepository.findAllActiveTokensByUser(user).forEach(token -> {
            token.setRevoked(true);
            token.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(token);
        });
    }

    private AuthResponse buildAuthResponse(String accessToken, String refreshToken, User user) {
        try {
            Set<String> roles = user.getRoles().stream()
                    .map(role -> role.getName())
                    .collect(java.util.stream.Collectors.toSet());

            Set<String> permissions = user.getRoles().stream()
                    .flatMap(role -> role.getPermissions() != null ? role.getPermissions().stream()
                            : java.util.stream.Stream.empty())
                    .map(permission -> permission.getName())
                    .collect(java.util.stream.Collectors.toSet());

            AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getPhoneNumber(),
                    user.getEmailVerified(),
                    roles,
                    permissions);

            AuthResponse authResponse = new AuthResponse();
            authResponse.setAccessToken(accessToken);
            authResponse.setRefreshToken(refreshToken);
            authResponse.setTokenType("Bearer");
            authResponse.setExpiresIn(jwtUtil.getAccessTokenExpiration());
            authResponse.setUser(userDto);
            return authResponse;
        } catch (Exception e) {
            System.err.println("Error building auth response: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private String generateToken() {
        return UUID.randomUUID().toString();
    }
}
