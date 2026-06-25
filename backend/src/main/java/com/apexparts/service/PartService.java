package com.apexparts.service;

import com.apexparts.model.NotificationRequest;
import com.apexparts.model.Part;
import com.apexparts.model.PartStatus;
import com.apexparts.repository.NotificationRequestRepository;
import com.apexparts.repository.PartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PartService {

    private final PartRepository partRepository;
    private final NotificationRequestRepository notificationRepository;

    public PartService(PartRepository partRepository, NotificationRequestRepository notificationRepository) {
        this.partRepository = partRepository;
        this.notificationRepository = notificationRepository;
    }

    public List<Part> getAllParts() {
        return partRepository.findAll();
    }

    public Optional<Part> getPartById(Long id) {
        return partRepository.findById(id);
    }

    @Transactional
    public Part createPart(Part part) {
        if (part.getCompatibility() == null || part.getCompatibility().isEmpty()) {
            part.setCompatibility(List.of("Universal"));
        }
        return partRepository.save(part);
    }

    @Transactional
    public Part updatePart(Long id, Part updatedPart) {
        Part existing = partRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Artikal sa ID-jem " + id + " ne postoji."));

        PartStatus oldStatus = existing.getStatus();
        
        existing.setName(updatedPart.getName());
        existing.setPartNumber(updatedPart.getPartNumber());
        existing.setDescription(updatedPart.getDescription());
        existing.setPrice(updatedPart.getPrice());
        existing.setManufacturer(updatedPart.getManufacturer());
        existing.setCategory(updatedPart.getCategory());
        existing.setStatus(updatedPart.getStatus());
        existing.setCompatibility(updatedPart.getCompatibility());

        Part saved = partRepository.save(existing);

        // Stock restock trigger: if changed from OUT_OF_STOCK to IN_STOCK, notify customers
        if (oldStatus == PartStatus.OUT_OF_STOCK && saved.getStatus() == PartStatus.IN_STOCK) {
            triggerAvailabilityNotifications(saved);
        }

        return saved;
    }

    @Transactional
    public void deletePart(Long id) {
        if (!partRepository.existsById(id)) {
            throw new IllegalArgumentException("Artikal sa ID-jem " + id + " ne postoji.");
        }
        partRepository.deleteById(id);
    }

    @Transactional
    public void registerNotification(Long partId, String contactType, String contactValue) {
        if (!partRepository.existsById(partId)) {
            throw new IllegalArgumentException("Artikal sa ID-jem " + partId + " ne postoji.");
        }
        NotificationRequest request = new NotificationRequest(partId, contactType, contactValue);
        notificationRepository.save(request);
    }

    private void triggerAvailabilityNotifications(Part part) {
        List<NotificationRequest> requests = notificationRepository.findByPartIdAndNotified(part.getId(), false);
        for (NotificationRequest request : requests) {
            System.out.println("[NOTIFIKACIJA DISPATCHER] Obaveštenje o stanju za artikal: " + part.getName());
            System.out.println("Kanal isporuke: " + request.getContactType() + " | Kontakt: " + request.getContactValue());
            System.out.println("Sadržaj: Poštovani, artikal '" + part.getName() + "' (" + part.getPartNumber() 
                    + ") koji ste čekali je ponovo na stanju! Trenutna cena: $" + part.getPrice() + ".");
            System.out.println("--------------------------------------------------------------------------------");
            request.setNotified(true);
            notificationRepository.save(request);
        }
    }
}
