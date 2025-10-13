// app/api/brands/[id]/route.ts
import { Prisma } from '@/generated/prisma';
import prisma from '@/lib/client';
import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

const apiBrandUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  logo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            available: true,
          },
          take: 10,
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!brand) {
      return NextResponse.json(
        { message: 'Marque non trouvée.' },
        { status: 404 }
      );
    }

    return NextResponse.json(brand, { status: 200 });
  } catch (error) {
    console.error('[BRAND_GET_BY_ID]', error);
    return NextResponse.json(
      { 
        message: 'Erreur lors de la récupération de la marque.', 
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
    const validatedData = apiBrandUpdateSchema.parse({ ...body, id });

    console.log('Données de mise à jour validées:', validatedData);

    const existingBrand = await prisma.brand.findUnique({
      where: { id }
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: 'Marque non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si le nom est déjà utilisé par une autre marque
    if (validatedData.name && validatedData.name !== existingBrand.name) {
      const duplicateBrand = await prisma.brand.findUnique({
        where: { name: validatedData.name }
      });

      if (duplicateBrand) {
        return NextResponse.json(
          { error: 'Une marque avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }

    const updateData: Prisma.BrandUpdateInput = {
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.description !== undefined && { description: validatedData.description }),
      ...(validatedData.logo !== undefined && { logo: validatedData.logo }),
      ...(validatedData.website !== undefined && { website: validatedData.website }),
      ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      updatedAt: new Date(),
    };

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    console.log('Marque mise à jour:', updatedBrand);

    return NextResponse.json(updatedBrand);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Erreur Zod:', error.issues);
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour de la marque:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour de la marque',
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

    const existingBrand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: 'Marque non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si la marque a des produits associés
    if (existingBrand._count.products > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer cette marque car elle est associée à ${existingBrand._count.products} produit(s)` },
        { status: 400 }
      );
    }

    await prisma.brand.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Marque supprimée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de la marque:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression de la marque',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}