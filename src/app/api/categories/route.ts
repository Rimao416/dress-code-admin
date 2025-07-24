// app/api/categories/route.ts
import prisma from '@/lib/client'
import { NextResponse } from 'next/server'
// POST: création de catégorie
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Le nom est requis.' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-')

    const category = await prisma.category.create({
      data: {
        name,
        description,
        slug,
      },
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
export async function GET() {
  try {
    const categories = await prisma.category.findMany()

    return NextResponse.json(categories, { status: 200 })
  } catch (error) {
    console.error('[CATEGORY_GET]', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des catégories.', error },
      { status: 500 }
    )
  }
}
