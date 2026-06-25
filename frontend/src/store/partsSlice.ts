import type { StateCreator } from 'zustand';
import type { Part } from './types';
import { API_BASE } from './types';

export interface PartsSlice {
  parts: Part[];
  activeVehicle: { make: string; model: string; year: number } | null;
  error: string | null;
  fetchParts: () => Promise<void>;
  addPart: (part: Omit<Part, 'id'>) => Promise<void>;
  updatePart: (id: string, updatedPart: Partial<Part>) => Promise<void>;
  deletePart: (id: string) => Promise<void>;
  setActiveVehicle: (vehicle: { make: string; model: string; year: number } | null) => void;
}

export const createPartsSlice: StateCreator<any, [], [], PartsSlice> = (set, _get) => ({
  parts: [],
  activeVehicle: null,
  error: null,

  fetchParts: async () => {
    try {
      const response = await fetch(`${API_BASE}/parts`);
      if (response.ok) {
        const data = await response.json();
        set({
          parts: data.map((p: any) => ({
            ...p,
            id: String(p.id)
          })),
          error: null
        });
      } else {
        set({ error: 'Server je vratio grešku prilikom učitavanja delova.' });
      }
    } catch (err) {
      set({ error: 'Spring Boot API nije dostupan. Molimo proverite konekciju sa serverom.' });
    }
  },

  addPart: async (partData) => {
    const response = await fetch(`${API_BASE}/parts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Greška pri dodavanju artikla');
    }
    const created = await response.json();
    const mapped = { ...created, id: String(created.id) };
    set((state: any) => ({
      parts: [mapped, ...state.parts]
    }));
  },

  updatePart: async (id, updatedPart) => {
    const response = await fetch(`${API_BASE}/parts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPart)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Greška pri izmeni artikla');
    }
    const updated = await response.json();
    const mapped = { ...updated, id: String(updated.id) };

    set((state: any) => {
      const oldPart = state.parts.find((p: Part) => p.id === id);
      if (oldPart && oldPart.status === 'OUT_OF_STOCK' && mapped.status === 'IN_STOCK') {
        const matchNotifications = state.notifications?.filter((n: any) => n.partId === id) || [];
        matchNotifications.forEach((n: any) => {
          console.log(`[NOTIFIKACIJA] Obaveštenje poslato za artikal: "${oldPart.name}"`);
          console.log(`Tip: ${n.contactType}, Kontakt: ${n.contactValue}`);
          console.log(`Tekst: Poštovani, artikal "${oldPart.name}" (${oldPart.partNumber}) koji ste čekali je ponovo na stanju! Cena: $${oldPart.price}.`);
        });
        return {
          parts: state.parts.map((p: Part) => p.id === id ? mapped : p),
          notifications: state.notifications?.filter((n: any) => n.partId !== id) || []
        };
      }
      return {
        parts: state.parts.map((p: Part) => p.id === id ? mapped : p)
      };
    });
  },

  deletePart: async (id) => {
    const response = await fetch(`${API_BASE}/parts/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Greška pri brisanju artikla');
    }
    set((state: any) => ({
      parts: state.parts.filter((p: Part) => p.id !== id)
    }));
  },

  setActiveVehicle: (vehicle) => set({ activeVehicle: vehicle })
});
