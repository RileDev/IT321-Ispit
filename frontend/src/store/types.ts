export const API_BASE = 'http://localhost:8080/api';

export interface Part {
  id: string;
  name: string;
  partNumber: string;
  description: string;
  price: number;
  manufacturer: string;
  category: string;
  status: 'IN_STOCK' | 'OUT_OF_STOCK';
  compatibility: string[];
}

export interface OrderItem {
  part: Part;
  quantity: number;
}

export interface Order {
  id: string;
  clientName: string;
  contactEmail: string;
  contactPhone: string;
  shippingAddress: string;
  paymentMethod: 'CARD' | 'CASH_ON_DELIVERY';
  totalPrice: number;
  status: 'CREATED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  items: OrderItem[];
}

export interface SpecialOrder {
  id: string;
  carDetails: {
    make: string;
    model: string;
    year: number;
    engine: string;
  };
  neededPartsDescription: string;
  clientEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  estimatedDeliveryDate?: string;
  pickupLocation?: string;
  priceEstimate?: number;
}

export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CLIENT' | 'GUEST';
  email?: string;
  phone?: string;
}

export interface AvailabilityNotificationRequest {
  id: string;
  partId: string;
  contactType: 'EMAIL' | 'PHONE';
  contactValue: string;
}
