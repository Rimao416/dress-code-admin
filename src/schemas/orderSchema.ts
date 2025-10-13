// =============================================
// schemas/orderSchema.ts
// =============================================

import { z } from 'zod';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@/types/order.type';

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
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  notes: z.string().max(500, 'Les notes ne doivent pas dépasser 500 caractères').optional(),
});

export const updateOrderSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  shippingCost: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export type OrderFormData = z.infer<typeof orderSchema>;
export type UpdateOrderFormData = z.infer<typeof updateOrderSchema>;