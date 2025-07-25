// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { productSchema } from '@/schemas/productSchema'
import { z } from 'zod'

const prisma = new PrismaClient()

// GET /api/products - Récupérer tous les produits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const categoryId = searchParams.get('categoryId')
    const subcategoryId = searchParams.get('subcategoryId')
    const available = searchParams.get('available')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Construction des filtres
    const where: any = {}
    
    if (categoryId) where.categoryId = categoryId
    if (subcategoryId) where.subcategoryId = subcategoryId
    if (available !== null) where.available = available === 'true'
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true }
          },
          variants: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

// POST /api/products - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données avec le schéma Zod (adaptation pour les données JSON)
    const productValidationSchema = productSchema.omit({ images: true }).extend({
      images: z.array(z.string()).min(1, 'Au moins une image est requise')
    })
    
    const validatedData = productValidationSchema.parse(body)

    // Vérifier que la catégorie existe
    const categoryExists = await prisma.category.findUnique({
      where: { id: validatedData.categoryId }
    })

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 400 }
      )
    }

    // Vérifier la sous-catégorie si fournie
    if (validatedData.subcategoryId) {
      const subcategoryExists = await prisma.subCategory.findUnique({
        where: { id: validatedData.subcategoryId }
      })

      if (!subcategoryExists) {
        return NextResponse.json(
          { error: 'Sous-catégorie non trouvée' },
          { status: 400 }
        )
      }
    }

    // Créer le produit avec ses variantes
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        images: validatedData.images,
        categoryId: validatedData.categoryId,
        stock: validatedData.stock,
        available: validatedData.available,
        variants: {
          create: validatedData.variants.map(variant => ({
            size: variant.size,
            color: variant.color,
            quantity: variant.quantity
          }))
        }
      },
      include: {
        category: {
          select: { id: true, name: true }
        },
        variants: true
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides',error: error },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création du produit:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du produit' },
      { status: 500 }
    )
  }
}
