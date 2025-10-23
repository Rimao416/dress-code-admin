// types/order.type.ts

export { OrderStatus, PaymentStatus, PaymentMethod } from '@/generated/prisma';

import { OrderStatus, PaymentStatus, PaymentMethod } from '@/generated/prisma';

export type Address = {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
};

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  
  phone?: string | null;
  user?: {
    email: string;
  };
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  productSku: string;
  variantInfo?: any | null;
  product?: {
    id: string;
    name: string;
    images: string[];
    sku: string;
  };
  variant?: {
    id: string;
    size?: string | null;
    color?: string | null;
    colorHex?: string | null;
  };
};

export type OrderTracking = {
  id: string;
  orderId: string;
  status: string;
  description?: string | null;
  location?: string | null;
  createdAt: Date | string;
};

export type OrderBase = {
  id: string;
  orderNumber: string;
  clientId: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddressId: string;
  billingAddressId: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

// Type pour une commande avec toutes les relations
export type Order = OrderBase & {
  client?: Client;
  shippingAddress?: Address;
  billingAddress?: Address;
  items?: OrderItem[];
  tracking?: OrderTracking[];
  _count?: {
    items: number;
    tracking: number;
  };
};

export type OrderStats = {
  totalItems: number;
  trackingEvents: number;
  estimatedDelivery?: string | null;
};

export type OrderFormData = {
  clientId: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
  }[];
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethod?: PaymentMethod;
  shippingCost?: number;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string | null;
};

export type CreateOrderData = OrderFormData;

export type UpdateOrderData = {
  id: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  shippingCost?: number;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string | null;
};