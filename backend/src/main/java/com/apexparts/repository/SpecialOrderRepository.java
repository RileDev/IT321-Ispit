package com.apexparts.repository;

import com.apexparts.model.SpecialOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpecialOrderRepository extends JpaRepository<SpecialOrder, Long> {
    List<SpecialOrder> findByClientEmail(String clientEmail);
}
