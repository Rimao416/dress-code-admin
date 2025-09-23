// app/api/categories/[id]/route.ts
import prisma from '@/lib/client'
import { NextResponse } from 'next/server'

// GET: récupération d'une catégorie par ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        _count: {
          select: {
            products: true,
            children: true,
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { message: 'Catégorie non trouvée.' },
        { status: 404 }
      )
    }

    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    console.error('[CATEGORY_GET_BY_ID]', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la catégorie.', error },
      { status: 500 }
    )
  }
}

// PUT: mise à jour d'une catégorie
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()
    const { name, description, parentId, image, isActive, sortOrder } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Le nom est requis.' }, { status: 400 })
    }

    // Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Catégorie non trouvée.' },
        { status: 404 }
      )
    }

    // Vérifier que la catégorie parente existe si parentId est fourni
    if (parentId && parentId !== id) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId }
      })
      
      if (!parentCategory) {
        return NextResponse.json(
          { message: 'La catégorie parente spécifiée n\'existe pas.' }, 
          { status: 400 }
        )
      }

      // Vérifier qu'on ne crée pas une référence circulaire
      const isCircular = await checkCircularReference(id, parentId)
      if (isCircular) {
        return NextResponse.json(
          { message: 'Impossible de définir cette catégorie comme parente (référence circulaire).' },
          { status: 400 }
        )
      }
    }

    // Mettre à jour le slug seulement si le nom a changé
    let updateData: any = {
      name: name.trim(),
      description: description?.trim() || null,
      parentId: parentId === id ? null : (parentId || null),
      image: image?.trim() || null,
      isActive: isActive ?? existingCategory.isActive,
      sortOrder: sortOrder ?? existingCategory.sortOrder,
    }

    if (name.trim() !== existingCategory.name) {
      const baseSlug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      let slug = baseSlug
      let counter = 1
      while (await prisma.category.findFirst({ 
        where: { slug, NOT: { id } } 
      })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      updateData.slug = slug
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        _count: {
          select: {
            products: true,
            children: true,
          }
        }
      }
    })

    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    console.error('[CATEGORY_PUT]', error)
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la catégorie.', error },
      { status: 500 }
    )
  }
}

// DELETE: suppression d'une catégorie
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Catégorie non trouvée.' },
        { status: 404 }
      )
    }

    // Vérifier qu'il n'y a pas de produits associés
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { message: 'Impossible de supprimer une catégorie contenant des produits.' },
        { status: 400 }
      )
    }

    // Vérifier qu'il n'y a pas de sous-catégories
    if (existingCategory._count.children > 0) {
      return NextResponse.json(
        { message: 'Impossible de supprimer une catégorie ayant des sous-catégories.' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Catégorie supprimée avec succès.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[CATEGORY_DELETE]', error)
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la catégorie.', error },
      { status: 500 }
    )
  }
}

// Fonction utilitaire pour vérifier les références circulaires
async function checkCircularReference(categoryId: string, parentId: string): Promise<boolean> {
  if (categoryId === parentId) return true

  const parent = await prisma.category.findUnique({
    where: { id: parentId },
    select: { parentId: true }
  })

  if (!parent || !parent.parentId) return false

  return checkCircularReference(categoryId, parent.parentId)
}