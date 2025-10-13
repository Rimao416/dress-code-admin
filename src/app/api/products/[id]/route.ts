// app/api/products/[id]/route.ts
import { Prisma } from '@/generated/prisma'
import prisma from '@/lib/client'
import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

const apiProductUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(), // On le reçoit mais on ne l'enregistre pas directement
  stock: z.number().int().min(0).optional(),
  available: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        size: z.string(),
        color: z.string(),
        quantity: z.number().int().min(0),
      })
    )
    .optional(),
})

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function generateVariantSKU(productSKU: string, size?: string | null, color?: string | null): string {
  const parts = [productSKU]
  if (size) parts.push(size.toUpperCase())
  if (color) parts.push(color.toUpperCase().substring(0, 3))
  return parts.join('-')
}

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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
          }
        },
        variants: {
          where: {
            isActive: true
          },
          orderBy: [
            { size: 'asc' },
            { color: 'asc' }
          ],
          select: {
            id: true,
            size: true,
            color: true,
            colorHex: true,
            material: true,
            sku: true,
            price: true,
            stock: true,
            images: true,
            isActive: true,
          }
        },
        reviews: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
          }
        },
        _count: {
          select: {
            variants: true,
            reviews: true,
            favorites: true,
            cartItems: true,
            orderItems: true,
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { message: 'Produit non trouvé.' },
        { status: 404 }
      )
    }

    const totalStock = product.variants.reduce((sum: number, v) => sum + v.stock, 0)
    const availableSizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))]
    const availableColors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))]
    
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r) => sum + r.rating, 0) / product.reviews.length
      : 0

    const enrichedProduct = {
      ...product,
      stats: {
        totalStock,
        availableSizes,
        availableColors,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: product._count.reviews,
        totalFavorites: product._count.favorites,
        totalOrders: product._count.orderItems,
      }
    }

    return NextResponse.json(enrichedProduct, { status: 200 })
  } catch (error) {
    console.error('[PRODUCT_GET_BY_ID]', error)
    return NextResponse.json(
      { 
        message: 'Erreur lors de la récupération du produit.', 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = apiProductUpdateSchema.parse({ ...body, id })

    console.log('Données de mise à jour validées:', validatedData)

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    // ✅ Déterminer le categoryId final (subcategoryId ou categoryId)
    // subcategoryId est une sous-catégorie qu'on doit enregistrer comme categoryId
    const finalCategoryId = validatedData.subcategoryId || validatedData.categoryId

    // ✅ Vérifier que la catégorie finale existe
    if (finalCategoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: finalCategoryId }
      })

      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Catégorie non trouvée' },
          { status: 400 }
        )
      }
    }

    const newSlug = validatedData.name ? generateSlug(validatedData.name) : undefined

    // ✅ Préparer les données de mise à jour (sans subcategoryId qui n'existe pas)
    const updateData: Prisma.ProductUpdateInput = {
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.description && { description: validatedData.description }),
      ...(validatedData.price !== undefined && { price: validatedData.price }),
      ...(validatedData.images && { images: validatedData.images }),
      // ✅ Utiliser finalCategoryId (qui peut être la subcategoryId ou categoryId)
      ...(finalCategoryId && { 
        category: { 
          connect: { id: finalCategoryId } 
        } 
      }),
      ...(validatedData.stock !== undefined && { stock: validatedData.stock }),
      ...(validatedData.available !== undefined && { available: validatedData.available }),
      ...(newSlug && { slug: newSlug }),
      updatedAt: new Date(),
    }

    // ✅ Gérer les variantes
    if (validatedData.variants && validatedData.variants.length > 0) {
      await prisma.productVariant.deleteMany({
        where: { productId: id }
      })

      updateData.variants = {
        create: validatedData.variants.map((variant: { size: string; color: string; quantity: number }) => {
          const variantSku = generateVariantSKU(
            existingProduct.sku, 
            variant.size, 
            variant.color
          )
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
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
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

    console.log('Produit mis à jour:', updatedProduct)

    return NextResponse.json(updatedProduct)
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Erreur Zod:', error.issues)
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la mise à jour du produit:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour du produit',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Produit supprimé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression du produit',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}