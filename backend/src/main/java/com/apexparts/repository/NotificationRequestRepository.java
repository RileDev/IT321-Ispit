package com.apexparts.repository;

import com.apexparts.model.NotificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRequestRepository extends JpaRepository<NotificationRequest, Long> {
    List<NotificationRequest> findByPartIdAndNotified(Long partId, Boolean notified);
}
