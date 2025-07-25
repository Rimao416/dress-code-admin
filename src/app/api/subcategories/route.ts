import { NextResponse } from 'next/server';
import { SubCategory } from '@/types/subCategory.type';
import prisma from '@/lib/client';

export async function GET() {
  try {
    const subCategories = await prisma.subCategory.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(subCategories);
  } catch {
    return NextResponse.json(
      { error: 'Échec de la récupération des sous-catégories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data: Omit<SubCategory, 'id' | 'createdAt' | 'updatedAt' | 'category'> = await request.json();

    const newSubCategory = await prisma.subCategory.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(newSubCategory, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Échec de la création de la sous-catégorie' },
      { status: 500 }
    );
  }
}
