// app/api/categories/route.ts
import prisma from '@/lib/client'
import { NextResponse } from 'next/server'

// POST: création de catégorie
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description, parentId, image, isActive, sortOrder } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Le nom est requis.' }, { status: 400 })
    }

    // Vérifier que la catégorie parente existe si parentId est fourni
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId }
      })
      
      if (!parentCategory) {
        return NextResponse.json(
          { message: 'La catégorie parente spécifiée n\'existe pas.' }, 
          { status: 400 }
        )
      }
    }

    // Générer le slug
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Vérifier l'unicité du slug
    let slug = baseSlug
    let counter = 1
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        slug,
        parentId: parentId || null,
        image: image?.trim() || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
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

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('[CATEGORY_POST]', error)
    return NextResponse.json(
      { message: 'Erreur lors de la création de la catégorie.', error },
      { status: 500 }
    )
  }
}

// GET: récupération de toutes les catégories
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const includeHierarchy = searchParams.get('hierarchy') === 'true'
    const onlyRoot = searchParams.get('root') === 'true'
    const parentId = searchParams.get('parentId')

    let whereClause: any = {}
    
    if (onlyRoot) {
      whereClause.parentId = null
    } else if (parentId) {
      whereClause.parentId = parentId
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        parent: includeHierarchy ? {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        } : false,
        children: includeHierarchy ? {
          select: {
            id: true,
            name: true,
            slug: true,
          },
          orderBy: {
            sortOrder: 'asc'
          }
        } : false,
        _count: {
          select: {
            products: true,
            children: true,
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(categories, { status: 200 })
  } catch (error) {
    console.error('[CATEGORY_GET]', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des catégories.', error },
      { status: 500 }
    )
  }
}