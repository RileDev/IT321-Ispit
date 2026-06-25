package com.apexparts.service;

import com.apexparts.model.NotificationRequest;
import com.apexparts.model.Part;
import com.apexparts.model.PartStatus;
import com.apexparts.repository.NotificationRequestRepository;
import com.apexparts.repository.PartRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PartServiceUnitTest {

    @Mock
    private PartRepository partRepository;

    @Mock
    private NotificationRequestRepository notificationRepository;

    @InjectMocks
    private PartService partService;

    @Test
    public void updatePart_TriggersNotificationsOnRestock() {
        // --- ARRANGE ---
        Long partId = 10L;
        
        Part existingPart = new Part("K&N Intake", "KNN-63", "Intake", 300.0, "K&N", "Engine", PartStatus.OUT_OF_STOCK, 0, List.of("Universal"));
        existingPart.setId(partId);

        Part updatedPart = new Part("K&N Intake", "KNN-63", "Intake", 300.0, "K&N", "Engine", PartStatus.IN_STOCK, 5, List.of("Universal"));
        updatedPart.setId(partId);

        NotificationRequest req1 = new NotificationRequest(partId, "EMAIL", "kupac1@mail.com");
        NotificationRequest req2 = new NotificationRequest(partId, "PHONE", "060-123-456");

        List<NotificationRequest> pendingRequests = new ArrayList<>(List.of(req1, req2));

        when(partRepository.findById(partId)).thenReturn(Optional.of(existingPart));
        when(partRepository.save(any(Part.class))).thenReturn(updatedPart);
        when(notificationRepository.findByPartIdAndNotified(partId, false)).thenReturn(pendingRequests);
        when(notificationRepository.save(any(NotificationRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // --- ACT ---
        Part savedPart = partService.updatePart(partId, updatedPart);

        // --- ASSERT ---
        assertNotNull(savedPart);
        assertEquals(PartStatus.IN_STOCK, savedPart.getStatus());
        
        // Assert that notification requests were updated to notified = true
        assertTrue(req1.getNotified());
        assertTrue(req2.getNotified());
        
        verify(partRepository, times(1)).findById(partId);
        verify(partRepository, times(1)).save(any(Part.class));
        verify(notificationRepository, times(1)).findByPartIdAndNotified(partId, false);
        verify(notificationRepository, times(2)).save(any(NotificationRequest.class));
    }

    @Test
    public void deletePart_ThrowsExceptionIfNotFound() {
        // --- ARRANGE ---
        Long partId = 99L;
        when(partRepository.existsById(partId)).thenReturn(false);

        // --- ACT & ASSERT ---
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            partService.deletePart(partId);
        });

        assertEquals("Artikal sa ID-jem 99 ne postoji.", exception.getMessage());
        verify(partRepository, times(1)).existsById(partId);
        verify(partRepository, never()).deleteById(anyLong());
    }
}
