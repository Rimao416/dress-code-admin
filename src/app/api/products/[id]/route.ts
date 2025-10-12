import prisma from '@/lib/client'
import { NextResponse } from 'next/server'

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

    // Calculer les statistiques
    const totalStock = product.variants.reduce((sum: number, v: any) => sum + v.stock, 0)
    const availableSizes = [...new Set(product.variants.map((v: any) => v.size).filter(Boolean))]
    const availableColors = [...new Set(product.variants.map((v: any) => v.color).filter(Boolean))]
    
    // Calculer la note moyenne
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
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
      { message: 'Erreur lors de la récupération du produit.', error },
      { status: 500 }
    )
  }
}