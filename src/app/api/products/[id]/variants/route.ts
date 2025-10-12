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

    const variants = await prisma.productVariant.findMany({
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

