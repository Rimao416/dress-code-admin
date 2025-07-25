import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@/generated/prisma'

const prisma = new PrismaClient()

// GET /api/products/search - Recherche avancée de produits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const categoryId = searchParams.get('categoryId')
    const available = searchParams.get('available')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    if (!query) {
      return NextResponse.json(
        { error: 'Paramètre de recherche manquant' },
        { status: 400 }
      )
    }

    const where: Prisma.ProductWhereInput = {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        { price: { gte: minPrice, lte: maxPrice } }
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (available !== null) {
      where.available = available === 'true'
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true }
        },
        variants: true
      },
      orderBy: { [sortBy]: sortOrder }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}
