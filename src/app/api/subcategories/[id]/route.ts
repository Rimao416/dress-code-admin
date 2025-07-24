// app/api/subcategories/[id]/route.ts
import prisma from '@/lib/client';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!subCategory) {
      return NextResponse.json(
        { error: 'Sous-catégorie non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(subCategory);
  } catch (error) {
    return NextResponse.json(
      { error: 'Échec de la récupération de la sous-catégorie' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const updatedSubCategory = await prisma.subCategory.update({
      where: { id: params.id },
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

    return NextResponse.json(updatedSubCategory);
  } catch (error) {
    return NextResponse.json(
      { error: 'Échec de la mise à jour de la sous-catégorie' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.subCategory.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Échec de la suppression de la sous-catégorie' },
      { status: 500 }
    );
  }
}