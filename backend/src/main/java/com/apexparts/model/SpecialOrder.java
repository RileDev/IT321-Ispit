package com.apexparts.model;

import jakarta.persistence.*;

@Entity
@Table(name = "special_orders")
public class SpecialOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String make;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private Integer year;

    private String engine;

    @Column(name = "needed_parts_description", length = 1000, nullable = false)
    private String neededPartsDescription;

    @Column(name = "client_email", nullable = false)
    private String clientEmail;

    @Column(nullable = false)
    private String status; // "PENDING", "APPROVED", "REJECTED"

    @Column(name = "estimated_delivery_date")
    private String estimatedDeliveryDate;

    @Column(name = "price_estimate")
    private Double priceEstimate;

    @Column(name = "pickup_location")
    private String pickupLocation;

    public SpecialOrder() {
    }

    public SpecialOrder(String make, String model, Integer year, String engine, String neededPartsDescription, String clientEmail, String status) {
        this.make = make;
        this.model = model;
        this.year = year;
        this.engine = engine;
        this.neededPartsDescription = neededPartsDescription;
        this.clientEmail = clientEmail;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getEngine() {
        return engine;
    }

    public void setEngine(String engine) {
        this.engine = engine;
    }

    public String getNeededPartsDescription() {
        return neededPartsDescription;
    }

    public void setNeededPartsDescription(String neededPartsDescription) {
        this.neededPartsDescription = neededPartsDescription;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEstimatedDeliveryDate() {
        return estimatedDeliveryDate;
    }

    public void setEstimatedDeliveryDate(String estimatedDeliveryDate) {
        this.estimatedDeliveryDate = estimatedDeliveryDate;
    }

    public Double getPriceEstimate() {
        return priceEstimate;
    }

    public void setPriceEstimate(Double priceEstimate) {
        this.priceEstimate = priceEstimate;
    }

    public String getPickupLocation() {
        return pickupLocation;
    }

    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }
}
