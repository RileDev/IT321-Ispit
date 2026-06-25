package com.apexparts.service;

import com.apexparts.model.User;
import com.apexparts.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllEmployees() {
        return userRepository.findAll().stream()
                .filter(u -> "EMPLOYEE".equals(u.getRole()))
                .toList();
    }

    @Transactional
    public User registerClient(User client) {
        if (userRepository.findByUsername(client.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Korisničko ime '" + client.getUsername() + "' je zauzeto.");
        }
        client.setRole("CLIENT");
        return userRepository.save(client);
    }

    @Transactional
    public User addEmployee(String adminUsername, String employeeUsername) {
        // Enforce role restriction: Only admin and employee can add employees
        User caller = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new IllegalArgumentException("Korisnik '" + adminUsername + "' nije pronađen."));

        if (!"ADMIN".equals(caller.getRole()) && !"EMPLOYEE".equals(caller.getRole())) {
            throw new SecurityException("Pristup odbijen. Samo administrator i zaposleni mogu dodati nove zaposlene.");
        }

        if (userRepository.findByUsername(employeeUsername).isPresent()) {
            throw new IllegalArgumentException("Korisničko ime zaposlenog '" + employeeUsername + "' je već u upotrebi.");
        }

        // Create new employee with default password matching their username
        User employee = new User(employeeUsername, employeeUsername, "EMPLOYEE", employeeUsername + "@apexparts.com", null);
        return userRepository.save(employee);
    }

    public User verifyLogin(String usernameOrEmail, String password) {
        User user = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new IllegalArgumentException("Korisnik sa tim korisničkim imenom ili e-mailom ne postoji."));

        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Pogrešna lozinka.");
        }

        return user;
    }
}
