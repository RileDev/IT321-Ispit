package com.apexparts.repository;

import com.apexparts.model.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PartRepository extends JpaRepository<Part, Long> {
    Optional<Part> findByPartNumber(String partNumber);
}
