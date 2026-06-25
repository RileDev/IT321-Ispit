package com.apexparts.service;

import com.apexparts.model.SpecialOrder;
import com.apexparts.repository.SpecialOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SpecialOrderService {

    private final SpecialOrderRepository specialOrderRepository;

    public SpecialOrderService(SpecialOrderRepository specialOrderRepository) {
        this.specialOrderRepository = specialOrderRepository;
    }

    public List<SpecialOrder> getAllSpecialOrders() {
        return specialOrderRepository.findAll();
    }

    public List<SpecialOrder> getSpecialOrdersForClient(String email) {
        return specialOrderRepository.findByClientEmail(email);
    }

    @Transactional
    public SpecialOrder createSpecialOrder(SpecialOrder specialOrder) {
        specialOrder.setStatus("PENDING");
        return specialOrderRepository.save(specialOrder);
    }

    @Transactional
    public SpecialOrder respondToSpecialOrder(Long id, String status, String estDeliveryDate, Double priceEstimate, String pickupLocation) {
        SpecialOrder existing = specialOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Specijalni upit sa ID-jem " + id + " ne postoji."));

        if (!"PENDING".equals(existing.getStatus())) {
            throw new IllegalStateException("Ovaj specijalni upit je već rešen. Trenutni status: " + existing.getStatus());
        }

        if (!"APPROVED".equals(status) && !"REJECTED".equals(status)) {
            throw new IllegalArgumentException("Nevažeći status za specijalni upit: " + status);
        }

        existing.setStatus(status);

        if ("APPROVED".equals(status)) {
            if (estDeliveryDate == null || estDeliveryDate.isBlank()) {
                throw new IllegalArgumentException("Datum isporuke je obavezan za odobrene upite.");
            }
            if (pickupLocation == null || pickupLocation.isBlank()) {
                throw new IllegalArgumentException("Mesto preuzimanja je obavezno za odobrene upite.");
            }
            existing.setEstimatedDeliveryDate(estDeliveryDate);
            existing.setPriceEstimate(priceEstimate);
            existing.setPickupLocation(pickupLocation);

            // Simulate email dispatch
            sendSupplierEmailNotification(existing);
        } else {
            sendRejectionEmailNotification(existing);
        }

        return specialOrderRepository.save(existing);
    }

    private void sendSupplierEmailNotification(SpecialOrder order) {
        System.out.println("[MEJL DOBAVLJAČA] Slanje obaveštenja klijentu: " + order.getClientEmail());
        System.out.println("Tema: Specijalna porudžbina br. " + order.getId() + " - Uspešno Nabavljena");
        System.out.println("Sadržaj: Poštovani, obaveštavamo Vas da je traženi deo za automobil '" 
                + order.getYear() + " " + order.getMake() + " " + order.getModel() + "' uspešno lociran kod našeg dobavljača.");
        System.out.println("Procenjena cena nabavke: $" + order.getPriceEstimate());
        System.out.println("Procenjeni datum prispeća u magacin: " + order.getEstimatedDeliveryDate());
        System.out.println("Mesto preuzimanja pošiljke: " + order.getPickupLocation());
        System.out.println("--------------------------------------------------------------------------------");
    }

    private void sendRejectionEmailNotification(SpecialOrder order) {
        System.out.println("[MEJL DOBAVLJAČA] Slanje obaveštenja klijentu: " + order.getClientEmail());
        System.out.println("Tema: Specijalna porudžbina br. " + order.getId() + " - Obaveštenje o nedostupnosti");
        System.out.println("Sadržaj: Poštovani, nažalost Vas obaveštavamo da nismo u mogućnosti da lociramo ili poručimo traženi deo za automobil '" 
                + order.getYear() + " " + order.getMake() + " " + order.getModel() + "' kod naših partnera.");
        System.out.println("--------------------------------------------------------------------------------");
    }
}
