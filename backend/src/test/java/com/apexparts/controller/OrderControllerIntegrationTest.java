package com.apexparts.controller;

import com.apexparts.dto.CartItemRequest;
import com.apexparts.dto.CreateOrderRequest;
import com.apexparts.model.Part;
import com.apexparts.model.PartStatus;
import com.apexparts.model.User;
import com.apexparts.repository.OrderRepository;
import com.apexparts.repository.PartRepository;
import com.apexparts.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * INTEGRACIONO TESTIRANJE REST API-JA (ZADATAK 3)
 * 
 * Sve integracione test metode u ovoj klasi prate sledeću putanju komponenti:
 * Controller -> Service -> Repository -> Testna baza podataka (in-memory H2)
 */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:apexparts_test;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
public class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Long savedClientId;
    private Long savedPartId;

    @BeforeEach
    public void setup() {
        orderRepository.deleteAll();
        partRepository.deleteAll();
        userRepository.deleteAll();

        // Seed users
        User client = userRepository.save(new User("johan", "pass", "CLIENT", "johan@mail.com", "060-111-222"));
        savedClientId = client.getId();
        
        userRepository.save(new User("marko", "marko", "EMPLOYEE", "marko@apexparts.com", "060-222-333"));

        // Seed active part
        Part part = partRepository.save(new Part(
                "Brembo Sport Brake Disc Set (Front)",
                "BRM-99120",
                "High-performance discs",
                250.0,
                "Brembo",
                "Brakes",
                PartStatus.IN_STOCK,
                10,
                List.of("Universal")
        ));
        savedPartId = part.getId();
    }

    /**
     * TEST 1 — Uspešno kreiranje porudžbine
     * Putanja: Controller -> Service -> Repository -> H2 DB
     */
    @Test
    public void placeOrder_Success() throws Exception {
        // Arrange
        CreateOrderRequest request = new CreateOrderRequest(
                List.of(new CartItemRequest(savedPartId, 2)),
                "Bulevar Kralja Aleksandra 12",
                "CARD",
                "060-111-222",
                "johan@mail.com"
        );

        // Act & Assert
        mockMvc.perform(post("/api/orders/" + savedClientId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("CREATED")))
                .andExpect(jsonPath("$.clientName", is("johan")))
                .andExpect(jsonPath("$.totalPrice", is(500.0))) // 250.0 * 2 = 500.0
                .andExpect(jsonPath("$.items[0].part.partNumber", is("BRM-99120")));

        // Check stock quantity reduced in H2 DB
        Part updatedPart = partRepository.findById(savedPartId).orElseThrow();
        assertEquals(8, updatedPart.getStockQuantity());
    }

    /**
     * TEST 2 — Poručivanje artikla koji nije na stanju
     * Putanja: Controller -> Service -> Repository -> H2 DB
     */
    @Test
    public void placeOrder_OutOfStock() throws Exception {
        // Arrange
        Part outOfStockPart = partRepository.save(new Part(
                "Castrol Oil",
                "CAS-00",
                "Syntec oil",
                50.0,
                "Castrol",
                "Fluids",
                PartStatus.OUT_OF_STOCK,
                0,
                List.of("Universal")
        ));

        CreateOrderRequest request = new CreateOrderRequest(
                List.of(new CartItemRequest(outOfStockPart.getId(), 1)),
                "Adresa 5",
                "CARD",
                "060-111-222",
                "johan@mail.com"
        );

        // Act & Assert
        mockMvc.perform(post("/api/orders/" + savedClientId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("nije dostupan u traženoj količini")));

        // Stock quantity must remain unchanged (0)
        Part checkPart = partRepository.findById(outOfStockPart.getId()).orElseThrow();
        assertEquals(0, checkPart.getStockQuantity());
        
        // No orders created
        assertEquals(0, orderRepository.count());
    }

    /**
     * TEST 3 — Neautorizovan pristup
     * Putanja: Controller -> Service -> H2 (Blokirano na nivou kontrolera)
     */
    @Test
    public void updateStatus_UnauthorizedClient() throws Exception {
        // Act & Assert
        mockMvc.perform(patch("/api/employee/orders/1/status")
                .header("Authorization", "Bearer mock-jwt-token-for-johan") // client token
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "PROCESSING"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("Klijenti ne mogu menjati status porudžbine")));
    }

    /**
     * TEST 4 — Promena statusa porudžbine
     * Putanja: Controller -> Service -> Repository -> H2 DB
     */
    @Test
    public void updateStatus_StateTransitions() throws Exception {
        // Arrange - Create an initial order
        CreateOrderRequest request = new CreateOrderRequest(
                List.of(new CartItemRequest(savedPartId, 1)),
                "Adresa 1",
                "CASH_ON_DELIVERY",
                "060",
                "johan@mail.com"
        );

        String orderJson = mockMvc.perform(post("/api/orders/" + savedClientId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long orderId = Long.valueOf(objectMapper.readTree(orderJson).get("id").asText());

        // Step 1: CREATED -> PROCESSING (Success)
        mockMvc.perform(patch("/api/employee/orders/" + orderId + "/status")
                .header("Authorization", "Bearer mock-jwt-token-for-marko") // employee token
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "PROCESSING"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PROCESSING")));

        // Step 2: PROCESSING -> SHIPPED (Success)
        mockMvc.perform(patch("/api/employee/orders/" + orderId + "/status")
                .header("Authorization", "Bearer mock-jwt-token-for-marko")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "SHIPPED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SHIPPED")));

        // Step 3: SHIPPED -> DELIVERED (Success)
        mockMvc.perform(patch("/api/employee/orders/" + orderId + "/status")
                .header("Authorization", "Bearer mock-jwt-token-for-marko")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "DELIVERED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DELIVERED")));

        // Step 4: DELIVERED -> CREATED (Failure, illegal transition)
        mockMvc.perform(patch("/api/employee/orders/" + orderId + "/status")
                .header("Authorization", "Bearer mock-jwt-token-for-marko")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "CREATED"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("Nije dozvoljena promena statusa sa DELIVERED na CREATED")));
    }
}
