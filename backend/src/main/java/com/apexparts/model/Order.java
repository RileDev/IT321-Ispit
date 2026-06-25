package com.apexparts.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Column(name = "contact_phone", nullable = false)
    private String contactPhone;

    @Column(name = "shipping_address", nullable = false)
    private String shippingAddress;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod; // "CARD", "CASH_ON_DELIVERY"

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @Column(nullable = false)
    private String status; // "NOT_DELIVERED", "DELIVERED", "CANCELLED"

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<OrderItem> items = new ArrayList<>();

    public Order() {
    }

    public Order(String clientName, String contactEmail, String contactPhone, String shippingAddress, String paymentMethod, Double totalPrice, String status, LocalDateTime createdAt, List<OrderItem> items) {
        this.clientName = clientName;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.totalPrice = totalPrice;
        this.status = status;
        this.createdAt = createdAt;
        this.items = items;
        if (items != null) {
            for (OrderItem item : items) {
                item.setOrder(this);
            }
        }
    }

    // Helper to add item and set self
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
        if (items != null) {
            for (OrderItem item : items) {
                item.setOrder(this);
            }
        }
    }
}
