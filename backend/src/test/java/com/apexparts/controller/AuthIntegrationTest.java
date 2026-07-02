package com.apexparts.controller;

import com.apexparts.model.User;
import com.apexparts.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AuthIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void registerClient_successfulRegistration() throws Exception {
        Map<String, String> requestPayload = new HashMap<>();
        requestPayload.put("firstName", "Petar");
        requestPayload.put("lastName", "Petrović");
        requestPayload.put("username", "petar_petrovic");
        requestPayload.put("email", "petar@example.com");
        requestPayload.put("password", "Test1234");
        requestPayload.put("phone", "061111222");

        String jsonRequest = objectMapper.writeValueAsString(requestPayload);

        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("petar@example.com"));

        Optional<User> user = userRepository.findByEmail("petar@example.com");

        assertTrue(user.isPresent(), "Korisnik mora da bude uspesno upisan u bazu podataka");

        User savedUser = user.get();

        assertNotEquals("Test1234", savedUser.getPassword(),
                "Lozinka ne sme biti upisana u bazu u plain-text formatu.");
        assertTrue(passwordEncoder.matches("Test1234", savedUser.getPassword()),
                "Sačuvana lozinka mora odgovarati originalnoj lozinki enkodovanoj BCrypt algoritmom.");
    }

}
