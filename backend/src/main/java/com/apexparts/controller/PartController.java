package com.apexparts.controller;

import com.apexparts.model.Part;
import com.apexparts.service.PartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parts")
@CrossOrigin(origins = "*")
public class PartController {

    private final PartService partService;

    public PartController(PartService partService) {
        this.partService = partService;
    }

    @GetMapping
    public ResponseEntity<List<Part>> getAllParts() {
        return ResponseEntity.ok(partService.getAllParts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Part> getPartById(@PathVariable Long id) {
        return partService.getPartById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Part> createPart(@RequestBody Part part) {
        Part created = partService.createPart(part);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePart(@PathVariable Long id, @RequestBody Part part) {
        try {
            Part updated = partService.updatePart(id, part);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePart(@PathVariable Long id) {
        try {
            partService.deletePart(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/notify")
    public ResponseEntity<?> registerNotification(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String contactType = payload.get("contactType");
        String contactValue = payload.get("contactValue");
        
        if (contactType == null || contactValue == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "contactType i contactValue su obavezni."));
        }
        
        try {
            partService.registerNotification(id, contactType, contactValue);
            return ResponseEntity.ok(Map.of("message", "Prijava za obaveštenje uspešno zabeležena."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
