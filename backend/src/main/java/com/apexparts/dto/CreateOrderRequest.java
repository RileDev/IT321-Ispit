package com.apexparts.dto;

import java.util.List;

public class CreateOrderRequest {
    private List<CartItemRequest> items;
    private String shippingAddress;
    private String paymentMethod;
    private String contactPhone;
    private String contactEmail;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(List<CartItemRequest> items, String shippingAddress, String paymentMethod, String contactPhone, String contactEmail) {
        this.items = items;
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
    }

    // Getters and Setters
    public List<CartItemRequest> getItems() {
        return items;
    }

    public void setItems(List<CartItemRequest> items) {
        this.items = items;
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

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }
}
