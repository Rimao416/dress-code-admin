// =============================================
// app/api/orders/[id]/route.ts
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import prisma from '@/lib/client';
import { updateOrderSchema } from '@/schemas/orderSchema';
import { ZodError } from 'zod';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
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
                sku: true,
              },
            },
            variant: {
              select: {
                id: true,
                size: true,
                color: true,
                colorHex: true,
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
    });

    if (!order) {
      return NextResponse.json(
        { message: 'Commande non trouvée.' },
        { status: 404 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('[ORDER_GET_BY_ID]', error);
    return NextResponse.json(
      { 
        message: 'Erreur lors de la récupération de la commande.', 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateOrderSchema.parse({ ...body, id });

    console.log('Données de mise à jour validées:', validatedData);

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: Prisma.OrderUpdateInput = {};

    // Ajouter les champs uniquement s'ils sont définis
    if (validatedData.status) {
      updateData.status = validatedData.status as any;
    }
    
    if (validatedData.paymentStatus) {
      updateData.paymentStatus = validatedData.paymentStatus as any;
    }
    
    if (validatedData.paymentMethod) {
      updateData.paymentMethod = validatedData.paymentMethod as any;
    }
    
    if (validatedData.shippingCost !== undefined) {
      updateData.shippingCost = validatedData.shippingCost;
    }
    
    if (validatedData.taxAmount !== undefined) {
      updateData.taxAmount = validatedData.taxAmount;
    }
    
    if (validatedData.discountAmount !== undefined) {
      updateData.discountAmount = validatedData.discountAmount;
    }
    
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    // Recalculer le total si les montants ont changé
    if (
      validatedData.shippingCost !== undefined ||
      validatedData.taxAmount !== undefined ||
      validatedData.discountAmount !== undefined
    ) {
      const shippingCost = validatedData.shippingCost ?? existingOrder.shippingCost;
      const taxAmount = validatedData.taxAmount ?? existingOrder.taxAmount;
      const discountAmount = validatedData.discountAmount ?? existingOrder.discountAmount;
      
      updateData.totalAmount = existingOrder.subtotal + shippingCost + taxAmount - discountAmount;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
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
      },
    });

    console.log('Commande mise à jour:', updatedOrder);

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Erreur Zod:', error.issues);
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour de la commande:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour de la commande',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Commande supprimée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression de la commande',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}