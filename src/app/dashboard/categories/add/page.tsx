'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import { Category } from '@/types/category.type'
import CategoryForm from '@/components/forms/CategoryForm'
import { createCategory, getCategoriesWithHierarchy } from '@/services/category.service'
import { useMessages } from '@/context/useMessage'
import { CategoryFormData } from '@/schemas/category.schema'
import { useTheme } from '@/context/ThemeContext'
import { useCategoryStore } from '@/store/categoryStore'

export default function AddCategoryPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setMessage } = useMessages()
  const { setLoading, setError, setCategories } = useCategoryStore()
  const { isDarkMode } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Charger les catégories au montage pour le sélecteur parent
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await getCategoriesWithHierarchy()
        setCategories(categories)
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error)
      }
    }

    loadCategories()
  }, [setCategories])

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    setLoading(true)
    
    try {
      const newCategory = await createCategory({
        name: data.name,
        description: data.description || undefined,
        parentId: data.parentId || null,
        image: data.image || undefined,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      })
     
      const formattedCategory: Category = {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        parentId: newCategory.parentId,
        parent: newCategory.parent,
        children: newCategory.children || [],
        image: newCategory.image,
        isActive: newCategory.isActive,
        sortOrder: newCategory.sortOrder,
        createdAt: new Date(newCategory.createdAt),
        updatedAt: new Date(newCategory.updatedAt),
        _count: newCategory._count,
      }
     
      // Mise à jour du cache React Query
      queryClient.setQueryData<Category[]>(['categories'], (old = []) => [
        ...old,
        formattedCategory,
      ])

      // Invalider et refetch les requêtes liées aux catégories
      queryClient.invalidateQueries({ queryKey: ['categories'] })
     
      setMessage('Catégorie créée avec succès', 'success')
      router.push('/dashboard/categories')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Une erreur inconnue est survenue'
      setError(errorMessage)
      setMessage(errorMessage, 'error')
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className='max-w-full'>
        <PageHeader
          breadcrumb={['Catégories', 'Ajouter une nouvelle catégorie']}
          title='Gestion des catégories'
        />
       
        {/* Main container with dark theme support */}
        <div className={`
          rounded-lg p-6 shadow-sm transition-all duration-300
          ${isDarkMode
            ? 'bg-gray-800/90 border border-gray-700 shadow-gray-900/20'
            : 'bg-white border border-gray-200 shadow-gray-100/50'
          }
        `}>
          <CategoryForm
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitButtonText='Ajouter la catégorie'
          />
        </div>
      </div>
    </DashboardLayout>
  )
}