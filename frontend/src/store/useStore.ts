import { create } from 'zustand';
import { createAuthSlice } from './authSlice';
import type { AuthSlice } from './authSlice';
import { createPartsSlice } from './partsSlice';
import type { PartsSlice } from './partsSlice';
import { createCartSlice } from './cartSlice';
import type { CartSlice } from './cartSlice';
import { createOrdersSlice } from './ordersSlice';
import type { OrdersSlice } from './ordersSlice';
import { createSpecialOrdersSlice } from './specialOrdersSlice';
import type { SpecialOrdersSlice } from './specialOrdersSlice';
import { createNotificationsSlice } from './notificationsSlice';
import type { NotificationsSlice } from './notificationsSlice';

export * from './types';

export type AppState = AuthSlice & PartsSlice & CartSlice & OrdersSlice & SpecialOrdersSlice & NotificationsSlice;

export const useStore = create<AppState>((...a) => ({
  ...createAuthSlice(...a),
  ...createPartsSlice(...a),
  ...createCartSlice(...a),
  ...createOrdersSlice(...a),
  ...createSpecialOrdersSlice(...a),
  ...createNotificationsSlice(...a),
}));
