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


// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const validatedData = apiProductSchema.parse(body)

//     const categoryExists = await prisma.category.findUnique({
//       where: { id: validatedData.categoryId }
//     })

//     if (!categoryExists) {
//       return NextResponse.json(
//         { error: 'Catégorie non trouvée' },
//         { status: 400 }
//       )
//     }

//     if (validatedData.subcategoryId) {
//       const subcategoryExists = await prisma.subCategory.findUnique({
//         where: { id: validatedData.subcategoryId }
//       })

//       if (!subcategoryExists) {
//         return NextResponse.json(
//           { error: 'Sous-catégorie non trouvée' },
//           { status: 400 }
//         )
//       }
//     }

//     const product = await prisma.product.create({
//       data: {
//         name: validatedData.name,
//         description: validatedData.description,
//         price: validatedData.price,
//         images: validatedData.images,
//         categoryId: validatedData.categoryId,
//         stock: validatedData.stock,
//         available: validatedData.available,
//         variants: {
//           create: validatedData.variants.map((variant) => ({
//             size: variant.size,
//             color: variant.color,
//             quantity: variant.quantity
//           }))
//         }
//       },
//       include: {
//         category: {
//           select: { id: true, name: true }
//         },
//         variants: true
//       }
//     })

//     return NextResponse.json(product, { status: 201 })
//   } catch (error) {
//     if (error instanceof ZodError) {
//       return NextResponse.json(
//         { error: 'Données invalides', details: error.issues },
//         { status: 400 }
//       )
//     }

//     console.error('Erreur lors de la création du produit:', error)
//     return NextResponse.json(
//       { error: 'Erreur lors de la création du produit' },
//       { status: 500 }
//     )
//   }
// }