package com.apexparts.service;

import com.apexparts.model.User;
import com.apexparts.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    public void verifyLogin_SuccessfulWithUsername() {
        // --- ARRANGE ---
        String username = "marko";
        String password = "password123";
        User user = new User(username, password, "EMPLOYEE", "marko@apexparts.com", "060-222-333");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        // --- ACT ---
        User verifiedUser = userService.verifyLogin(username, password);

        // --- ASSERT ---
        assertNotNull(verifiedUser);
        assertEquals(username, verifiedUser.getUsername());
        assertEquals("EMPLOYEE", verifiedUser.getRole());
        verify(userRepository, times(1)).findByUsername(username);
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    public void verifyLogin_SuccessfulWithEmail() {
        // --- ARRANGE ---
        String email = "marko@apexparts.com";
        String username = "marko";
        String password = "password123";
        User user = new User(username, password, "EMPLOYEE", email, "060-222-333");

        when(userRepository.findByUsername(email)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // --- ACT ---
        User verifiedUser = userService.verifyLogin(email, password);

        // --- ASSERT ---
        assertNotNull(verifiedUser);
        assertEquals(username, verifiedUser.getUsername());
        assertEquals(email, verifiedUser.getEmail());
        verify(userRepository, times(1)).findByUsername(email);
        verify(userRepository, times(1)).findByEmail(email);
    }

    @Test
    public void verifyLogin_UserNotFound() {
        // --- ARRANGE ---
        String query = "nonexistent";
        String password = "password123";

        when(userRepository.findByUsername(query)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(query)).thenReturn(Optional.empty());

        // --- ACT & ASSERT ---
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.verifyLogin(query, password);
        });

        assertEquals("Korisnik sa tim korisničkim imenom ili e-mailom ne postoji.", exception.getMessage());
        verify(userRepository, times(1)).findByUsername(query);
        verify(userRepository, times(1)).findByEmail(query);
    }

    @Test
    public void verifyLogin_IncorrectPassword() {
        // --- ARRANGE ---
        String username = "marko";
        String password = "correctPassword";
        String incorrectPassword = "wrongPassword";
        User user = new User(username, password, "EMPLOYEE", "marko@apexparts.com", "060-222-333");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        // --- ACT & ASSERT ---
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.verifyLogin(username, incorrectPassword);
        });

        assertEquals("Pogrešna lozinka.", exception.getMessage());
        verify(userRepository, times(1)).findByUsername(username);
    }

    @Test
    public void addEmployee_SuccessfulAsEmployee() {
        // --- ARRANGE ---
        String employeeCaller = "marko";
        String newEmployeeName = "jovan";
        User caller = new User(employeeCaller, "pass", "EMPLOYEE", "marko@apexparts.com", "060-222-333");

        when(userRepository.findByUsername(employeeCaller)).thenReturn(Optional.of(caller));
        when(userRepository.findByUsername(newEmployeeName)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // --- ACT ---
        User savedEmployee = userService.addEmployee(employeeCaller, newEmployeeName);

        // --- ASSERT ---
        assertNotNull(savedEmployee);
        assertEquals(newEmployeeName, savedEmployee.getUsername());
        assertEquals("EMPLOYEE", savedEmployee.getRole());
        verify(userRepository, times(1)).findByUsername(employeeCaller);
        verify(userRepository, times(1)).findByUsername(newEmployeeName);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    public void addEmployee_ForbiddenAsClient() {
        // --- ARRANGE ---
        String clientCaller = "johan";
        String newEmployeeName = "jovan";
        User caller = new User(clientCaller, "pass", "CLIENT", "johan@apexparts.com", "060-111-222");

        when(userRepository.findByUsername(clientCaller)).thenReturn(Optional.of(caller));

        // --- ACT & ASSERT ---
        SecurityException exception = assertThrows(SecurityException.class, () -> {
            userService.addEmployee(clientCaller, newEmployeeName);
        });

        assertEquals("Pristup odbijen. Samo administrator i zaposleni mogu dodati nove zaposlene.", exception.getMessage());
        verify(userRepository, times(1)).findByUsername(clientCaller);
        verify(userRepository, never()).save(any(User.class));
    }
}
