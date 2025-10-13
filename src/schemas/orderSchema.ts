import { z } from 'zod';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@/types/order.type';

// Créer des enums Zod directement depuis les valeurs Prisma
const OrderStatusEnum = z.enum([
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
] as const);

const PaymentStatusEnum = z.enum([
  PaymentStatus.PENDING,
  PaymentStatus.COMPLETED,
  PaymentStatus.FAILED,
  PaymentStatus.REFUNDED,
] as const);

const PaymentMethodEnum = z.enum([
  PaymentMethod.CARD,
  PaymentMethod.PAYPAL,
  PaymentMethod.APPLE_PAY,
  PaymentMethod.GOOGLE_PAY,
] as const);

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Le produit est requis'),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1, 'La quantité doit être au moins 1'),
  unitPrice: z.number().min(0, 'Le prix unitaire doit être positif'),
});

export const orderSchema = z.object({
  clientId: z.string().min(1, 'Le client est requis'),
  items: z.array(orderItemSchema).min(1, 'Au moins un article est requis'),
  shippingAddressId: z.string().min(1, 'L\'adresse de livraison est requise'),
  billingAddressId: z.string().min(1, 'L\'adresse de facturation est requise'),
  shippingCost: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  paymentMethod: PaymentMethodEnum.optional(),
  notes: z.string().max(500, 'Les notes ne doivent pas dépasser 500 caractères').optional(),
});

export const updateOrderSchema = z.object({
  id: z.string().min(1),
  status: OrderStatusEnum.optional(),
  paymentStatus: PaymentStatusEnum.optional(),
  paymentMethod: PaymentMethodEnum.optional(),
  shippingCost: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
  paymentStatus: PaymentStatusEnum.optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;
export type UpdateOrderFormData = z.infer<typeof updateOrderSchema>;