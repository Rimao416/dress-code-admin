// app/api/categories/[id]/route.ts
import prisma from '@/lib/client'
import { NextRequest, NextResponse } from 'next/server'

// Type pour les erreurs Prisma
interface PrismaError extends Error {
  code?: string;
}

// GET - Récupérer une catégorie par ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await des params dans Next.js 15
    const { id } = await params

    if (!id) {
      return NextResponse.json({ message: "L'ID est requis." }, { status: 400 })
    }

    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      return NextResponse.json({ message: 'Catégorie non trouvée.' }, { status: 404 })
    }

    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    console.error('[CATEGORY_GET_ONE]', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la catégorie.' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une catégorie
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await des params dans Next.js 15
    const { id } = await params

    const body = await req.json()
    const { name, description } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { message: "Le nom est requis et doit être une chaîne de caractères." },
        { status: 400 }
      )
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description: description || null,
      },
    })

    return NextResponse.json(updatedCategory, { status: 200 })
  } catch (error) {
    console.error('[CATEGORY_UPDATE]', error)

    // Type guard pour vérifier si c'est une erreur Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as PrismaError
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: 'Catégorie non trouvée.' }, { status: 404 })
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la catégorie.', error: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await des params dans Next.js 15
    const { id } = await params

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Catégorie supprimée avec succès.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[CATEGORY_DELETE]', error)

    // Type guard pour vérifier si c'est une erreur Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as PrismaError
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: 'Catégorie non trouvée.' }, { status: 404 })
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la catégorie.', error: errorMessage },
      { status: 500 }
    )
  }
}