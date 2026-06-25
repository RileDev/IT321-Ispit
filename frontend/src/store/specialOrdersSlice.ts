import type { StateCreator } from 'zustand';
import type { SpecialOrder } from './types';
import { API_BASE } from './types';

export interface SpecialOrdersSlice {
  specialOrders: SpecialOrder[];
  fetchSpecialOrders: () => Promise<void>;
  createSpecialOrder: (soData: Omit<SpecialOrder, 'id' | 'status'>) => Promise<void>;
  respondToSpecialOrder: (id: string, updates: Partial<SpecialOrder>) => Promise<void>;
}

export const createSpecialOrdersSlice: StateCreator<any, [], [], SpecialOrdersSlice> = (set, get) => ({
  specialOrders: [],

  fetchSpecialOrders: async () => {
    const user = get().user;
    if (!user) return;

    let url = `${API_BASE}/special-orders`;
    if (user.role === 'CLIENT') {
      url = `${API_BASE}/special-orders/client?email=${encodeURIComponent(user.email || '')}`;
    }

    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      set({
        specialOrders: data.map((so: any) => ({
          id: String(so.id),
          carDetails: {
            make: so.make,
            model: so.model,
            year: so.year,
            engine: so.engine
          },
          neededPartsDescription: so.neededPartsDescription,
          clientEmail: so.clientEmail,
          status: so.status,
          estimatedDeliveryDate: so.estimatedDeliveryDate,
          pickupLocation: so.pickupLocation,
          priceEstimate: so.priceEstimate
        }))
      });
    }
  },

  createSpecialOrder: async (soData) => {
    const bodyData = {
      make: soData.carDetails.make,
      model: soData.carDetails.model,
      year: soData.carDetails.year,
      engine: soData.carDetails.engine,
      neededPartsDescription: soData.neededPartsDescription,
      clientEmail: soData.clientEmail,
      status: 'PENDING'
    };

    const response = await fetch(`${API_BASE}/special-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Greška pri slanju specijalnog upita');
    }

    const created = await response.json();
    const mapped = {
      id: String(created.id),
      carDetails: {
        make: created.make,
        model: created.model,
        year: created.year,
        engine: created.engine
      },
      neededPartsDescription: created.neededPartsDescription,
      clientEmail: created.clientEmail,
      status: created.status as SpecialOrder['status']
    };

    set((state: any) => ({
      specialOrders: [mapped, ...state.specialOrders]
    }));
  },

  respondToSpecialOrder: async (id, updates) => {
    const response = await fetch(`${API_BASE}/special-orders/${id}/respond`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: updates.status,
        estimatedDeliveryDate: updates.estimatedDeliveryDate,
        pickupLocation: updates.pickupLocation,
        priceEstimate: updates.priceEstimate
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Greška pri slanju odgovora na specijalni upit');
    }

    const updated = await response.json();
    const mapped = {
      id: String(updated.id),
      carDetails: {
        make: updated.make,
        model: updated.model,
        year: updated.year,
        engine: updated.engine
      },
      neededPartsDescription: updated.neededPartsDescription,
      clientEmail: updated.clientEmail,
      status: updated.status as SpecialOrder['status'],
      estimatedDeliveryDate: updated.estimatedDeliveryDate,
      pickupLocation: updated.pickupLocation,
      priceEstimate: updated.priceEstimate
    };

    set((state: any) => {
      if (updates.status === 'APPROVED') {
        console.log(`[MEJL DOBAVLJAČA] Poslat mejl klijentu: ${mapped.clientEmail}`);
        console.log(`Tema: Specijalna porudžbina ${mapped.id} - Odobrena!`);
        console.log(`Tekst: Vaš traženi deo za automobil (${mapped.carDetails.make} ${mapped.carDetails.model}) je dostupan kod našeg dobavljača.`);
        console.log(`Procenjeni datum isporuke: ${mapped.estimatedDeliveryDate}. Lokacija preuzimanja: ${mapped.pickupLocation}. Procenjena cena: $${mapped.priceEstimate}`);
      } else if (updates.status === 'REJECTED') {
        console.log(`[MEJL DOBAVLJAČA] Poslat mejl klijentu: ${mapped.clientEmail}`);
        console.log(`Tema: Specijalna porudžbina ${mapped.id} - Odbijena`);
        console.log(`Tekst: Nažalost, nismo u mogućnosti da nabavimo traženi deo kod našeg dobavljača.`);
      }

      return {
        specialOrders: state.specialOrders.map((so: SpecialOrder) => (so.id === id ? mapped : so))
      };
    });
  }
});
