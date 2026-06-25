package com.apexparts.service;

import com.apexparts.dto.CartItemRequest;
import com.apexparts.dto.CreateOrderRequest;
import com.apexparts.model.Order;
import com.apexparts.model.OrderItem;
import com.apexparts.model.Part;
import com.apexparts.model.PartStatus;
import com.apexparts.model.User;
import com.apexparts.repository.OrderRepository;
import com.apexparts.repository.PartRepository;
import com.apexparts.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PartRepository partRepository;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository, PartRepository partRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.partRepository = partRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    public List<Order> getOrdersForClient(String clientName, String email) {
        return orderRepository.findByClientNameOrContactEmail(clientName, email);
    }

    @Transactional
    public Order createOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new IllegalArgumentException("Porudžbina mora da sadrži bar jedan artikal.");
        }

        order.setStatus("CREATED");
        order.setCreatedAt(LocalDateTime.now());

        // Connect bidirectionally
        for (OrderItem item : order.getItems()) {
            item.setOrder(order);
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order createOrder(Long clientId, CreateOrderRequest request) {
        // 1. Proveri da li klijent postoji
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Klijent sa ID-jem " + clientId + " ne postoji."));

        // 2. Proveri da li korpa sadrži najmanje jedan artikal
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Porudžbina mora da sadrži bar jedan artikal.");
        }

        Order order = new Order();
        order.setClientName(client.getUsername());
        order.setContactEmail(request.getContactEmail() != null ? request.getContactEmail() : client.getEmail());
        order.setContactPhone(request.getContactPhone() != null ? request.getContactPhone() : client.getPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("CREATED"); // 5. Postavi početni status na CREATED

        double total = 0.0;
        for (CartItemRequest itemReq : request.getItems()) {
            // 3. Proveri dostupnu količinu svakog artikla
            Part part = partRepository.findById(itemReq.getPartId())
                    .orElseThrow(() -> new IllegalArgumentException("Artikal sa ID-jem " + itemReq.getPartId() + " ne postoji."));

            if (part.getStockQuantity() < itemReq.getQuantity()) {
                throw new IllegalArgumentException("Artikal '" + part.getName() + "' nije dostupan u traženoj količini.");
            }

            // 4. Izračunaj ukupnu cenu porudžbine
            double priceAtPurchase = part.getPrice();
            total += priceAtPurchase * itemReq.getQuantity();

            // 6. Umanji količinu artikala na stanju
            part.setStockQuantity(part.getStockQuantity() - itemReq.getQuantity());
            if (part.getStockQuantity() == 0) {
                part.setStatus(PartStatus.OUT_OF_STOCK);
            }
            partRepository.save(part);

            OrderItem orderItem = new OrderItem(part, itemReq.getQuantity(), priceAtPurchase);
            order.addItem(orderItem);
        }

        order.setTotalPrice(total);

        // 7. Sačuvaj porudžbinu u bazi
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStatus(Long id, String status) {
        Order existing = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Porudžbina sa ID-jem " + id + " ne postoji."));

        String current = existing.getStatus();

        if (current.equals(status)) {
            return existing;
        }

        // Validate state machine transitions
        boolean valid = false;
        if ("CREATED".equals(current)) {
            valid = "PROCESSING".equals(status) || "CANCELLED".equals(status);
        } else if ("PROCESSING".equals(current)) {
            valid = "SHIPPED".equals(status) || "CANCELLED".equals(status);
        } else if ("SHIPPED".equals(current)) {
            valid = "DELIVERED".equals(status) || "CANCELLED".equals(status);
        }

        if (!valid) {
            throw new IllegalStateException("Nije dozvoljena promena statusa sa " + current + " na " + status);
        }

        existing.setStatus(status);
        return orderRepository.save(existing);
    }
}
