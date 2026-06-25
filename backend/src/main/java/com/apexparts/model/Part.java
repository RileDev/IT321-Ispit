package com.apexparts.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "parts")
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "part_number", unique = true, nullable = false)
    private String partNumber;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String manufacturer;

    @Column(nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartStatus status; // IN_STOCK, OUT_OF_STOCK

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "part_compatibility", joinColumns = @JoinColumn(name = "part_id"))
    @Column(name = "vehicle_name")
    private List<String> compatibility = new ArrayList<>();

    public Part() {
    }

    public Part(String name, String partNumber, String description, Double price, String manufacturer, String category, PartStatus status, Integer stockQuantity, List<String> compatibility) {
        this.name = name;
        this.partNumber = partNumber;
        this.description = description;
        this.price = price;
        this.manufacturer = manufacturer;
        this.category = category;
        this.status = status;
        this.stockQuantity = stockQuantity;
        this.compatibility = compatibility;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public PartStatus getStatus() {
        return status;
    }

    public void setStatus(PartStatus status) {
        this.status = status;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }


    public List<String> getCompatibility() {
        return compatibility;
    }

    public void setCompatibility(List<String> compatibility) {
        this.compatibility = compatibility;
    }
}
