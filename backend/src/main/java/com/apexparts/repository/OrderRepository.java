package com.apexparts.repository;

import com.apexparts.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(String status);
    List<Order> findByClientNameOrContactEmail(String clientName, String contactEmail);
}
