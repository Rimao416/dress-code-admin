// app/api/brands/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { apiBrandSchema } from '@/schemas/brandSchema';
import { ZodError } from 'zod';
import prisma from '@/lib/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const where: Prisma.BrandWhereInput = {};

    if (isActive !== null) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const brands = await prisma.brand.findMany({
      where,
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(brands);

    return NextResponse.json({ brands });
  } catch (error) {
    console.error('Erreur lors de la récupération des marques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des marques' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = apiBrandSchema.parse(body);

    console.log('Données validées:', validatedData);

    // Vérifier si la marque existe déjà
    const existingBrand = await prisma.brand.findUnique({
      where: { name: validatedData.name }
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: 'Une marque avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        logo: validatedData.logo || null,
        website: validatedData.website || null,
        isActive: validatedData.isActive !== false,
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    console.log('Marque créée:', brand);

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Erreur Zod:', error.issues);
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création de la marque:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la marque' },
      { status: 500 }
    );
  }
}