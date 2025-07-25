
// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { productSchema } from '@/schemas/productSchema'
import { z } from 'zod'

const prisma = new PrismaClient()

// GET /api/products/[id] - Récupérer un produit par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: { id: true, name: true }
        },
        variants: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du produit' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Mettre à jour un produit
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    // Validation des données
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

    // Transaction pour mettre à jour le produit et ses variantes
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Supprimer les anciennes variantes
      await tx.variant.deleteMany({
        where: { productId: params.id }
      })

      // Mettre à jour le produit et créer les nouvelles variantes
      const product = await tx.product.update({
        where: { id: params.id },
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

      return product
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la mise à jour du produit:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Supprimer un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le produit (les variantes seront supprimées automatiquement grâce à la cascade)
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Produit supprimé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    )
  }
}



