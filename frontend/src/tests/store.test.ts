import { describe, test, expect, beforeEach } from 'vitest';
import { useStore } from '../store/useStore';

const mockPart = {
  id: '1',
  name: 'Brembo Brake Disc Set',
  partNumber: 'BRM-101',
  description: 'High performance brake discs',
  price: 150,
  manufacturer: 'Brembo',
  category: 'Brakes',
  status: 'IN_STOCK' as const,
  compatibility: ['Universal']
};

describe('Zustand Store Unit Tests (State Logic)', () => {

  beforeEach(() => {
    // Reset store state
    const store = useStore.getState();
    store.clearCart();
    store.setActiveVehicle(null);
  });

  // TEST 1: addToCart - increments quantity for duplicates
  test('addToCart increments quantity when adding duplicate items instead of adding new lines', () => {
    const store = useStore.getState();

    // Add first time
    store.addToCart(mockPart, 1);
    expect(useStore.getState().cart).toHaveLength(1);
    expect(useStore.getState().cart[0].quantity).toBe(1);

    // Add second time
    store.addToCart(mockPart, 2);
    expect(useStore.getState().cart).toHaveLength(1); // Still 1 line item
    expect(useStore.getState().cart[0].quantity).toBe(3); // Quantity accumulated: 1 + 2 = 3
  });

  // TEST 2: updateCartQuantity - clamps quantity to minimum of 1
  test('updateCartQuantity clamps negative or zero quantities to minimum of 1', () => {
    const store = useStore.getState();

    // Setup item in cart
    store.addToCart(mockPart, 5);
    expect(useStore.getState().cart[0].quantity).toBe(5);

    // Attempt to update quantity to 0
    store.updateCartQuantity('1', 0);
    expect(useStore.getState().cart[0].quantity).toBe(1); // Clamped to 1

    // Attempt to update quantity to a negative number
    store.updateCartQuantity('1', -10);
    expect(useStore.getState().cart[0].quantity).toBe(1); // Clamped to 1
  });

  // TEST 3: clearCart - resets cart to empty list
  test('clearCart empties the shopping cart list', () => {
    const store = useStore.getState();

    store.addToCart(mockPart, 2);
    expect(useStore.getState().cart).toHaveLength(1);

    store.clearCart();
    expect(useStore.getState().cart).toHaveLength(0);
  });

  // TEST 4: setActiveVehicle - updates active vehicle matcher state
  test('setActiveVehicle correctly sets and clears active vehicle in state', () => {
    const store = useStore.getState();
    expect(useStore.getState().activeVehicle).toBeNull();

    const vehicle = { make: 'Audi', model: 'A4', year: 2018 };
    
    // Set vehicle
    store.setActiveVehicle(vehicle);
    expect(useStore.getState().activeVehicle).toEqual(vehicle);

    // Clear vehicle
    store.setActiveVehicle(null);
    expect(useStore.getState().activeVehicle).toBeNull();
  });
});
