// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@/generated/prisma'
import { apiProductSchema } from '@/schemas/productSchema'
import { ZodError } from 'zod'
import prisma from '@/lib/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const available = searchParams.get('available')
    const search = searchParams.get('search')

    // ✅ Utilisation du type Prisma généré au lieu de 'any'
    const where: Prisma.ProductWhereInput = {}

    if (categoryId) where.categoryId = categoryId
    if (available !== null) where.available = available === 'true'
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true }
        },
        variants: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(products)

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

// ✅ Utilitaire pour générer un slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ✅ Utilitaire pour générer un SKU unique
function generateSKU(productName: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `SKU-${timestamp}-${randomStr}`
}

// ✅ Utilitaire pour générer un SKU de variante
function generateVariantSKU(productSKU: string, size?: string | null, color?: string | null): string {
  const parts = [productSKU]
  if (size) parts.push(size.toUpperCase())
  if (color) parts.push(color.toUpperCase().substring(0, 3))
  return parts.join('-')
}

// ✅ Utilitaire pour obtenir le code hex d'une couleur
function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    purple: '#8b5cf6',
    pink: '#ec4899',
    black: '#000000',
    white: '#ffffff',
    gray: '#6b7280',
    orange: '#f97316',
  }
  return colorMap[color.toLowerCase()] || '#000000'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = apiProductSchema.parse(body)

    console.log('Données validées:', validatedData)

    // ✅ Vérifier que la catégorie existe
    const categoryExists = await prisma.category.findUnique({
      where: { id: validatedData.categoryId }
    })

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 400 }
      )
    }

    // ✅ Générer le SKU et le slug
    const sku = generateSKU(validatedData.name)
    const slug = generateSlug(validatedData.name)

    // ✅ Créer le produit avec les variantes
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        images: validatedData.images,
        categoryId: validatedData.categoryId,
        sku: sku,
        slug: slug,
        stock: validatedData.stock || 0,
        available: validatedData.available !== false,
        // Champs optionnels avec valeurs par défaut
       shortDescription: validatedData.shortDescription || null,
comparePrice: validatedData.comparePrice || null,
featured: validatedData.featured ?? false,
isNewIn: validatedData.isNewIn ?? false,
tags: validatedData.tags || [],
metaTitle: validatedData.metaTitle || null,
metaDescription: validatedData.metaDescription || null,
weight: validatedData.weight || null,
dimensions: validatedData.dimensions ? validatedData.dimensions : Prisma.JsonNull,
        // ✅ Créer les variantes si elles existent
        variants: validatedData.variants && validatedData.variants.length > 0
          ? {
              create: validatedData.variants.map((variant) => {
                const variantSku = generateVariantSKU(sku, variant.size, variant.color)
                return {
                  size: variant.size || null,
                  color: variant.color || null,
                  colorHex: variant.color ? getColorHex(variant.color) : null,
                  material: null,
                  sku: variantSku,
                  price: null,
                  stock: variant.quantity || 0,
                  images: [],
                  isActive: true,
                }
              })
            }
          : undefined,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: true,
        brand: true,
      },
    })

    console.log('Produit créé:', product)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Erreur Zod:', error.issues)
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
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