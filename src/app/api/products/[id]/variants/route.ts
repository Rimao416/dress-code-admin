import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { variantSchema } from '@/schemas/productSchema'
import { ZodError } from 'zod'

const prisma = new PrismaClient()

// GET /api/products/[id]/variants - Récupérer les variantes d'un produit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const variants = await prisma.variant.findMany({
      where: { productId: id }
    })

    return NextResponse.json(variants)
  } catch (error) {
    console.error('Erreur lors de la récupération des variantes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des variantes' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/variants - Ajouter une variante à un produit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const body = await request.json()
    const validatedData = variantSchema.parse(body)

    const productExists = await prisma.product.findUnique({
      where: { id }
    })

    if (!productExists) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    const variant = await prisma.variant.create({
      data: {
        productId: id,
        size: validatedData.size,
        color: validatedData.color,
        quantity: validatedData.quantity
      }
    })

    return NextResponse.json(variant, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création de la variante:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la variante' },
      { status: 500 }
    )
  }
}
