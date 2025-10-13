// =============================================
// types/order.type.ts
// =============================================

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

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
  email: string;
  phone?: string | null;
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
  };
  variant?: {
    id: string;
    size?: string | null;
    color?: string | null;
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
};

export type Order = OrderBase & {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
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
  shippingCost?: number;
  taxAmount?: number;
  discountAmount?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
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
  notes?: string;
};