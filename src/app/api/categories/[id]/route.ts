import prisma from '@/lib/client';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: 'L\'ID est requis.' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Catégorie non trouvée.' },
        { status: 404 }
      );
    }

    return NextResponse.json(category, { status: 200 });

  } catch (error) {
    console.error('[CATEGORY_GET_ONE]', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la catégorie.', error },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ message: "L'ID est requis." }, { status: 400 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: "Le nom est requis et doit être une chaîne de caractères." }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(updatedCategory, { status: 200 });

  } catch (error: any) {
    console.error('[CATEGORY_UPDATE]', error);

    if (error.code === 'P2025') {
      // Prisma error for "record not found"
      return NextResponse.json({ message: "Catégorie non trouvée." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Erreur lors de la mise à jour de la catégorie.", error: error.message },
      { status: 500 }
    );
  }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ message: "L'ID est requis." }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Catégorie supprimée avec succès.' }, { status: 200 });

  } catch (error: any) {
    console.error('[CATEGORY_DELETE]', error);

    if (error.code === 'P2025') {
      // Erreur Prisma : enregistrement non trouvé
      return NextResponse.json({ message: "Catégorie non trouvée." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Erreur lors de la suppression de la catégorie.", error: error.message },
      { status: 500 }
    );
  }
}