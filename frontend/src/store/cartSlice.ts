import type { StateCreator } from 'zustand';
import type { Part, OrderItem } from './types';

export interface CartSlice {
  cart: OrderItem[];
  addToCart: (part: Part, quantity?: number) => void;
  removeFromCart: (partId: string) => void;
  updateCartQuantity: (partId: string, quantity: number) => void;
  clearCart: () => void;
}

export const createCartSlice: StateCreator<any, [], [], CartSlice> = (set) => ({
  cart: [],

  addToCart: (part, quantity = 1) => set((state: any) => {
    const existing = state.cart.find((item: OrderItem) => item.part.id === part.id);
    if (existing) {
      return {
        cart: state.cart.map((item: OrderItem) =>
          item.part.id === part.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      };
    }
    return { cart: [...state.cart, { part, quantity }] };
  }),

  removeFromCart: (partId) => set((state: any) => ({
    cart: state.cart.filter((item: OrderItem) => item.part.id !== partId)
  })),

  updateCartQuantity: (partId, quantity) => set((state: any) => ({
    cart: state.cart.map((item: OrderItem) =>
      item.part.id === partId ? { ...item, quantity: Math.max(1, quantity) } : item
    )
  })),

  clearCart: () => set({ cart: [] })
});
