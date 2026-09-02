package com.medistock.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.dto.RegisterRequest;
import com.medistock.entity.User;
import com.medistock.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class RegistrationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testEndToEndUserRegistration() throws Exception {
        String testEmail = "dharshan.verify@medistock.com";

        // Ensure clean state for test email
        userRepository.findByEmail(testEmail).ifPresent(userRepository::delete);

        RegisterRequest request = new RegisterRequest();
        request.setEmail(testEmail);
        request.setPassword("Dharshan@123");
        request.setConfirmPassword("Dharshan@123");
        request.setFirstName("Dharshan");
        request.setLastName("Kumar");
        request.setPhoneNumber("+919876543210");
        request.setRole("Pharmacist");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data.accessToken").exists())
                .andExpect(jsonPath("$.data.user.email").value(testEmail))
                .andExpect(jsonPath("$.data.user.firstName").value("Dharshan"))
                .andExpect(jsonPath("$.data.user.lastName").value("Kumar"));

        // Verify user was persisted in database table
        Optional<User> savedUserOpt = userRepository.findByEmail(testEmail);
        assertTrue(savedUserOpt.isPresent(), "User should be persisted in users table");
        User savedUser = savedUserOpt.get();
        assertEquals("Dharshan", savedUser.getFirstName());
        assertEquals("Kumar", savedUser.getLastName());
        assertFalse(savedUser.getRoles().isEmpty(), "User should be assigned a role");
        assertTrue(savedUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_PHARMACIST")), "User should have ROLE_PHARMACIST");
    }
}
