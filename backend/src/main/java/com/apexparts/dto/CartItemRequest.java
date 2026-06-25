package com.apexparts.dto;

public class CartItemRequest {
    private Long partId;
    private Integer quantity;

    public CartItemRequest() {
    }

    public CartItemRequest(Long partId, Integer quantity) {
        this.partId = partId;
        this.quantity = quantity;
    }

    // Getters and Setters
    public Long getPartId() {
        return partId;
    }

    public void setPartId(Long partId) {
        this.partId = partId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
