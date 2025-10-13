// =============================================
// app/api/orders/route.ts
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { orderSchema } from '@/schemas/orderSchema';
import { ZodError } from 'zod';
import prisma from '@/lib/client';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${randomStr}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Prisma.OrderWhereInput = {};

    if (clientId) where.clientId = clientId;
    if (status) where.status = status as any;
    if (paymentStatus) where.paymentStatus = paymentStatus as any;
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { 
          client: { 
            firstName: { contains: search, mode: 'insensitive' } 
          } 
        },
        { 
          client: { 
            lastName: { contains: search, mode: 'insensitive' } 
          } 
        },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
            variant: {
              select: {
                id: true,
                size: true,
                color: true,
              },
            },
          },
        },
        tracking: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            items: true,
            tracking: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    console.log('Données de commande validées:', validatedData);

    // Vérifier que le client existe
    const clientExists = await prisma.client.findUnique({
      where: { id: validatedData.clientId },
    });

    if (!clientExists) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 400 }
      );
    }

    // Vérifier les adresses
    const [shippingAddress, billingAddress] = await Promise.all([
      prisma.address.findUnique({ where: { id: validatedData.shippingAddressId } }),
      prisma.address.findUnique({ where: { id: validatedData.billingAddressId } }),
    ]);

    if (!shippingAddress || !billingAddress) {
      return NextResponse.json(
        { error: 'Adresse non trouvée' },
        { status: 400 }
      );
    }

    // Calculer les totaux
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const shippingCost = validatedData.shippingCost || 0;
    const taxAmount = validatedData.taxAmount || 0;
    const discountAmount = validatedData.discountAmount || 0;
    const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;

    // Préparer les données des items
    const itemsData: Prisma.OrderItemCreateWithoutOrderInput[] = await Promise.all(
      validatedData.items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Produit ${item.productId} non trouvé`);
        }

        const variant = item.variantId
          ? await prisma.productVariant.findUnique({
              where: { id: item.variantId },
            })
          : null;

        const itemData: Prisma.OrderItemCreateWithoutOrderInput = {
          product: {
            connect: { id: item.productId }
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          productName: product.name,
          productSku: product.sku,
        };

        // Ajouter variant seulement s'il existe
        if (item.variantId) {
          itemData.variant = {
            connect: { id: item.variantId }
          };
        }

        // Gérer variantInfo pour les champs JSON
        if (variant) {
          itemData.variantInfo = {
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex,
          } as Prisma.InputJsonValue;
        }

        return itemData;
      })
    );

    // Préparer les données de la commande
    const orderData: Prisma.OrderCreateInput = {
      orderNumber: generateOrderNumber(),
      client: {
        connect: { id: validatedData.clientId }
      },
      status: 'PENDING',
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      totalAmount,
      shippingAddress: {
        connect: { id: validatedData.shippingAddressId }
      },
      billingAddress: {
        connect: { id: validatedData.billingAddressId }
      },
      paymentStatus: 'PENDING',
      items: {
        create: itemsData,
      },
    };

    // Ajouter paymentMethod seulement s'il est défini
    if (validatedData.paymentMethod) {
      orderData.paymentMethod = validatedData.paymentMethod as any;
    }

    // Ajouter notes seulement s'il est défini
    if (validatedData.notes) {
      orderData.notes = validatedData.notes;
    }

    // Créer la commande avec les items
    const order = await prisma.order.create({
      data: orderData,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
            variant: {
              select: {
                id: true,
                size: true,
                color: true,
              },
            },
          },
        },
      },
    });

    console.log('Commande créée:', order);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Erreur Zod:', error.issues);
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de la commande',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}