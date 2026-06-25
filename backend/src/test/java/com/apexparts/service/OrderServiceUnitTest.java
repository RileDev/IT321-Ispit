package com.apexparts.service;

import com.apexparts.dto.CartItemRequest;
import com.apexparts.dto.CreateOrderRequest;
import com.apexparts.model.Order;
import com.apexparts.model.Part;
import com.apexparts.model.PartStatus;
import com.apexparts.model.User;
import com.apexparts.repository.OrderRepository;
import com.apexparts.repository.PartRepository;
import com.apexparts.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * OBJAŠNJENJE ZA ZADATAK 2:
 * 
 * 1. Jedinica koja se testira (Unit under test):
 *    - To je klasa {@link OrderService}, tačnije njena biznis metoda createOrder(Long, CreateOrderRequest).
 *      Testiramo isključivo logiku ove metode izolovanu od mrežnih slojeva, baza podataka i eksternih sistema.
 * 
 * 2. Simulirane zavisnosti (Mocked dependencies):
 *    - Simulirani su repozitorijumi: {@link OrderRepository}, {@link UserRepository} i {@link PartRepository}.
 *      Mockito zamenjuje stvarne implementacije ovih interfejsa lažnim objektima koji vraćaju predefinisane vrednosti.
 * 
 * 3. Zašto se ne koristi prava baza podataka u jediničnim testovima:
 *    - Jedinični testovi moraju biti brzi (izvršavaju se u milisekundama) i izolovani (rezultat jednog testa ne sme da utiče na drugi).
 *    - Korišćenje prave baze zahteva I/O komunikaciju, podizanje konekcija, čišćenje tabela pre svakog testa i konfiguraciju baze podataka.
 *    - Ako bi baza bila nedostupna ili bi podaci bili izmenjeni, jedinični testovi bi pali iako je kod servisa ispravan.
 */
@ExtendWith(MockitoExtension.class)
public class OrderServiceUnitTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PartRepository partRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    public void createOrder_Successful() {
        // --- ARRANGE ---
        Long clientId = 1L;
        User client = new User("johan", "pass", "CLIENT", "johan@mail.com", "060-111-222");
        client.setId(clientId);

        Part part = new Part("Brembo Discs", "BRM-99", "Brake discs", 100.0, "Brembo", "Brakes", PartStatus.IN_STOCK, 10, List.of("Universal"));
        part.setId(10L);

        List<CartItemRequest> cartItems = List.of(new CartItemRequest(10L, 2));
        CreateOrderRequest request = new CreateOrderRequest(cartItems, "Bulevar Kralja Aleksandra 12", "CARD", "060-111-222", "johan@mail.com");

        when(userRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(partRepository.findById(10L)).thenReturn(Optional.of(part));
        
        // Mock save returning the order itself
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // --- ACT ---
        Order createdOrder = orderService.createOrder(clientId, request);

        // --- ASSERT ---
        assertNotNull(createdOrder);
        assertEquals("johan", createdOrder.getClientName());
        assertEquals("CREATED", createdOrder.getStatus());
        assertEquals(200.0, createdOrder.getTotalPrice()); // 100.0 * 2
        assertEquals(8, part.getStockQuantity()); // Quantity decreased: 10 - 2 = 8
        verify(userRepository, times(1)).findById(clientId);
        verify(partRepository, times(1)).findById(10L);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    public void createOrder_EmptyCart() {
        // --- ARRANGE ---
        Long clientId = 1L;
        User client = new User("johan", "pass", "CLIENT", "johan@mail.com", "060-111-222");

        CreateOrderRequest request = new CreateOrderRequest(new ArrayList<>(), "Bulevar 12", "CARD", "060-111-222", "johan@mail.com");

        when(userRepository.findById(clientId)).thenReturn(Optional.of(client));

        // --- ACT & ASSERT ---
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            orderService.createOrder(clientId, request);
        });

        assertEquals("Porudžbina mora da sadrži bar jedan artikal.", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    public void createOrder_ClientDoesNotExist() {
        // --- ARRANGE ---
        Long clientId = 99L;
        CreateOrderRequest request = new CreateOrderRequest(List.of(new CartItemRequest(10L, 2)), "Bulevar 12", "CARD", "060", "johan@mail.com");

        when(userRepository.findById(clientId)).thenReturn(Optional.empty());

        // --- ACT & ASSERT ---
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            orderService.createOrder(clientId, request);
        });

        assertEquals("Klijent sa ID-jem 99 ne postoji.", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    public void createOrder_InsufficientStock() {
        // --- ARRANGE ---
        Long clientId = 1L;
        User client = new User("johan", "pass", "CLIENT", "johan@mail.com", "060-111-222");

        Part part = new Part("K&N Intake", "KNN-63", "Intake", 300.0, "K&N", "Engine", PartStatus.IN_STOCK, 1, List.of("Universal"));
        part.setId(10L);

        List<CartItemRequest> cartItems = List.of(new CartItemRequest(10L, 2)); // Requests 2, stock is 1
        CreateOrderRequest request = new CreateOrderRequest(cartItems, "Bulevar 12", "CARD", "060-111-222", "johan@mail.com");

        when(userRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(partRepository.findById(10L)).thenReturn(Optional.of(part));

        // --- ACT & ASSERT ---
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            orderService.createOrder(clientId, request);
        });

        assertEquals("Artikal 'K&N Intake' nije dostupan u traženoj količini.", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    public void createOrder_CorrectTotalPriceCalculation() {
        // --- ARRANGE ---
        Long clientId = 1L;
        User client = new User("johan", "pass", "CLIENT", "johan@mail.com", "060-111-222");

        Part partA = new Part("Castrol Oil", "CAS-5W", "Oil", 40.0, "Castrol", "Fluids", PartStatus.IN_STOCK, 10, List.of("Universal"));
        partA.setId(5L);
        Part partB = new Part("Spark Plugs", "BOS-02", "Spark plugs", 10.0, "Bosch", "Engine", PartStatus.IN_STOCK, 10, List.of("Universal"));
        partB.setId(6L);

        List<CartItemRequest> cartItems = List.of(
                new CartItemRequest(5L, 3), // 3 * 40.0 = 120.0
                new CartItemRequest(6L, 5)  // 5 * 10.0 = 50.0
        ); // Expected Total = 170.0

        CreateOrderRequest request = new CreateOrderRequest(cartItems, "Bulevar 12", "CARD", "060-111-222", "johan@mail.com");

        when(userRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(partRepository.findById(5L)).thenReturn(Optional.of(partA));
        when(partRepository.findById(6L)).thenReturn(Optional.of(partB));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // --- ACT ---
        Order createdOrder = orderService.createOrder(clientId, request);

        // --- ASSERT ---
        assertNotNull(createdOrder);
        assertEquals(170.0, createdOrder.getTotalPrice());
        verify(orderRepository, times(1)).save(any(Order.class));
    }
}
