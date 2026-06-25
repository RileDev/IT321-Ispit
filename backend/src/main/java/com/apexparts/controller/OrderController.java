package com.apexparts.controller;

import com.apexparts.dto.CreateOrderRequest;
import com.apexparts.model.Order;
import com.apexparts.model.SpecialOrder;
import com.apexparts.service.OrderService;
import com.apexparts.service.SpecialOrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;
    private final SpecialOrderService specialOrderService;

    public OrderController(OrderService orderService, SpecialOrderService specialOrderService) {
        this.orderService = orderService;
        this.specialOrderService = specialOrderService;
    }

    // --- Standard Orders API ---

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@RequestBody Order order) {
        try {
            Order saved = orderService.createOrder(order);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{clientId}")
    public ResponseEntity<?> placeOrderWithClient(@PathVariable Long clientId, @RequestBody CreateOrderRequest request) {
        try {
            Order saved = orderService.createOrder(clientId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(orderService.getOrdersByStatus(status));
        }
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/orders/client")
    public ResponseEntity<List<Order>> getClientOrders(
            @RequestParam String clientName,
            @RequestParam(required = false) String email) {
        return ResponseEntity.ok(orderService.getOrdersForClient(clientName, email));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status parametar je obavezan."));
        }
        try {
            Order updated = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/employee/orders/{id}/status")
    public ResponseEntity<?> patchOrderStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        // Simulated JWT validation
        if (authHeader == null || !authHeader.startsWith("Bearer mock-jwt-token-for-")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Pristup odbijen. Neautorizovan zahtev."));
        }

        String username = authHeader.substring("Bearer mock-jwt-token-for-".length());
        
        // Johan is a CLIENT. Marko/Ana are employees.
        if ("johan".equalsIgnoreCase(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Pristup odbijen. Klijenti ne mogu menjati status porudžbine."));
        }

        String status = payload.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status parametar je obavezan."));
        }

        try {
            Order updated = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    // --- Special Orders API ---

    @PostMapping("/special-orders")
    public ResponseEntity<SpecialOrder> placeSpecialOrder(@RequestBody SpecialOrder specialOrder) {
        SpecialOrder saved = specialOrderService.createSpecialOrder(specialOrder);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/special-orders")
    public ResponseEntity<List<SpecialOrder>> getSpecialOrders() {
        return ResponseEntity.ok(specialOrderService.getAllSpecialOrders());
    }

    @GetMapping("/special-orders/client")
    public ResponseEntity<List<SpecialOrder>> getClientSpecialOrders(@RequestParam String email) {
        return ResponseEntity.ok(specialOrderService.getSpecialOrdersForClient(email));
    }

    @PutMapping("/special-orders/{id}/respond")
    public ResponseEntity<?> respondToSpecialOrder(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String status = (String) payload.get("status");
        String estDeliveryDate = (String) payload.get("estimatedDeliveryDate");
        String pickupLocation = (String) payload.get("pickupLocation");
        
        Double priceEstimate = null;
        if (payload.get("priceEstimate") != null) {
            priceEstimate = Double.valueOf(payload.get("priceEstimate").toString());
        }

        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status parametar je obavezan."));
        }

        try {
            SpecialOrder updated = specialOrderService.respondToSpecialOrder(id, status, estDeliveryDate, priceEstimate, pickupLocation);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
