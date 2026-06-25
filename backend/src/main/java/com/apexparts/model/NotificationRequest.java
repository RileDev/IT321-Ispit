package com.apexparts.model;

import jakarta.persistence.*;

@Entity
@Table(name = "notification_requests")
public class NotificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "part_id", nullable = false)
    private Long partId;

    @Column(name = "contact_type", nullable = false)
    private String contactType; // "EMAIL", "PHONE"

    @Column(name = "contact_value", nullable = false)
    private String contactValue;

    @Column(nullable = false)
    private Boolean notified = false;

    public NotificationRequest() {
    }

    public NotificationRequest(Long partId, String contactType, String contactValue) {
        this.partId = partId;
        this.contactType = contactType;
        this.contactValue = contactValue;
        this.notified = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPartId() {
        return partId;
    }

    public void setPartId(Long partId) {
        this.partId = partId;
    }

    public String getContactType() {
        return contactType;
    }

    public void setContactType(String contactType) {
        this.contactType = contactType;
    }

    public String getContactValue() {
        return contactValue;
    }

    public void setContactValue(String contactValue) {
        this.contactValue = contactValue;
    }

    public Boolean getNotified() {
        return notified;
    }

    public void setNotified(Boolean notified) {
        this.notified = notified;
    }
}
