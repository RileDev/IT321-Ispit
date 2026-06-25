import type { StateCreator } from 'zustand';
import type { AvailabilityNotificationRequest } from './types';
import { API_BASE } from './types';

export interface NotificationsSlice {
  notifications: AvailabilityNotificationRequest[];
  registerNotification: (partId: string, contactType: 'EMAIL' | 'PHONE', contactValue: string) => Promise<void>;
}

export const createNotificationsSlice: StateCreator<any, [], [], NotificationsSlice> = (set) => ({
  notifications: [],

  registerNotification: async (partId, contactType, contactValue) => {
    const response = await fetch(`${API_BASE}/parts/${partId}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactType, contactValue })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Greška pri registraciji obaveštenja');
    }

    set((state: any) => ({
      notifications: [
        ...state.notifications,
        {
          id: `notif-${Date.now()}`,
          partId,
          contactType,
          contactValue
        }
      ]
    }));
  }
});
