import type { StateCreator } from 'zustand';
import type { Order } from './types';
import { API_BASE } from './types';

export interface OrdersSlice {
  orders: Order[];
  fetchOrders: () => Promise<void>;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
}

export const createOrdersSlice: StateCreator<any, [], [], OrdersSlice> = (set, get) => ({
  orders: [],

  fetchOrders: async () => {
    const user = get().user;
    if (!user) return;

    let url = `${API_BASE}/orders`;
    if (user.role === 'CLIENT') {
      url = `${API_BASE}/orders/client?clientName=${encodeURIComponent(user.username)}&email=${encodeURIComponent(user.email || '')}`;
    }

    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      set({
        orders: data.map((o: any) => ({
          ...o,
          id: String(o.id),
          items: o.items.map((item: any) => ({
            ...item,
            part: { ...item.part, id: String(item.part.id) }
          }))
        }))
      });
    }
  },

  createOrder: async (orderData) => {
    const user = get().user;
    const isClient = user && user.role === 'CLIENT' && !isNaN(Number(user.id));

    let url = `${API_BASE}/orders`;
    let bodyData: any;

    if (isClient) {
      url = `${API_BASE}/orders/${user.id}`;
      bodyData = {
        items: orderData.items.map(item => ({
          partId: Number(item.part.id),
          quantity: item.quantity
        })),
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        contactPhone: orderData.contactPhone,
        contactEmail: orderData.contactEmail
      };
    } else {
      url = `${API_BASE}/orders`;
      bodyData = {
        clientName: orderData.clientName,
        contactEmail: orderData.contactEmail,
        contactPhone: orderData.contactPhone,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        totalPrice: orderData.totalPrice,
        items: orderData.items.map(item => ({
          part: { id: Number(item.part.id) },
          quantity: item.quantity,
          priceAtPurchase: item.part.price
        }))
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Greška pri kreiranju porudžbine');
    }

    const savedOrder = await response.json();
    const mappedOrder = {
      ...savedOrder,
      id: String(savedOrder.id),
      items: savedOrder.items.map((item: any) => ({
        ...item,
        part: { ...item.part, id: String(item.part.id) }
      }))
    };

    set((state: any) => ({
      orders: [mappedOrder, ...state.orders],
      cart: []
    }));

    return mappedOrder;
  },

  updateOrderStatus: async (id, status) => {
    const user = get().user;
    const token = get().token || `mock-jwt-token-for-${user?.username || 'Gost'}`;
    const response = await fetch(`${API_BASE}/employee/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Greška pri promeni statusa porudžbine');
    }
    const updated = await response.json();
    const mappedUpdated = {
      ...updated,
      id: String(updated.id),
      items: updated.items.map((item: any) => ({
        ...item,
        part: { ...item.part, id: String(item.part.id) }
      }))
    };
    set((state: any) => ({
      orders: state.orders.map((o: Order) => (o.id === id ? mappedUpdated : o))
    }));
  }
});
