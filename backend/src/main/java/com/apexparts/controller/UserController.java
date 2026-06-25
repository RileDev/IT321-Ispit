package com.apexparts.controller;

import com.apexparts.model.User;
import com.apexparts.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        try {
            User user = userService.verifyLogin(username, password);
            return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "role", user.getRole(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "token", "mock-jwt-token-for-" + user.getUsername()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User client) {
        try {
            User registered = userService.registerClient(client);
            return ResponseEntity.status(HttpStatus.CREATED).body(registered);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/employees")
    public ResponseEntity<List<User>> getEmployees() {
        return ResponseEntity.ok(userService.getAllEmployees());
    }

    @PostMapping("/employees")
    public ResponseEntity<?> addEmployee(@RequestBody Map<String, String> payload) {
        String adminUsername = payload.get("adminUsername");
        String employeeUsername = payload.get("employeeUsername");
        try {
            User employee = userService.addEmployee(adminUsername, employeeUsername);
            return ResponseEntity.status(HttpStatus.CREATED).body(employee);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
