import prisma from '@/lib/client'
import { NextResponse } from 'next/server'
import { Prisma } from '@/generated/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const subCategory = await prisma.subCategory.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!subCategory) {
      return NextResponse.json(
        { error: 'Sous-catégorie non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(subCategory)
  } catch {
    return NextResponse.json(
      { error: 'Échec de la récupération de la sous-catégorie' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const updatedSubCategory = await prisma.subCategory.update({
      where: { id },
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
    })

    return NextResponse.json(updatedSubCategory)
  } catch (error) {
    const err = error as Prisma.PrismaClientKnownRequestError

    if (err.code === 'P2025') {
      return NextResponse.json(
        { error: 'Sous-catégorie non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Échec de la mise à jour de la sous-catégorie' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.subCategory.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const err = error as Prisma.PrismaClientKnownRequestError

    if (err.code === 'P2025') {
      return NextResponse.json(
        { error: 'Sous-catégorie non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Échec de la suppression de la sous-catégorie' },
      { status: 500 }
    )
  }
}
