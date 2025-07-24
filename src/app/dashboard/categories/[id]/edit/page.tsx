'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import { useCategoryStore } from '@/store/categoryStore'
import { Category } from '@/types/category.type'
import CategoryForm from '@/components/forms/CategoryForm'
import { updateCategory } from '@/services/category.service'
import { useMessages } from '@/context/useMessage'
import { CategoryFormData } from '@/schemas/category.schema'
import { useCategory } from '@/hooks/categories/useCategory'
import { useTheme } from '@/context/ThemeContext'

export default function EditCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setMessage } = useMessages()
  const { setLoading, setError } = useCategoryStore()
  const { isDarkMode } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)
 
  const categoryId = params.id as string
  
  // Vérification de l'ID et redirection si invalide
  useEffect(() => {
    if (!categoryId) {
      setMessage('Invalid category ID', 'error')
      router.push('/dashboard/categories')
    }
  }, [categoryId, router, setMessage])

  const {
    data: category,
    isLoading,
    error,
    status,
  } = useCategory(categoryId) // Utiliser string au lieu de Number(categoryId)

  // Gestion des erreurs de chargement
  useEffect(() => {
    if (status === 'error') {
      setMessage('Category not found', 'error')
      router.push('/dashboard/categories')
    }
  }, [status, router, setMessage])

  const onSubmit = async (data: CategoryFormData) => {
    if (!category) return
    
    setIsSubmitting(true)
    setLoading(true)
    
    try {
      // Préparer les données de mise à jour avec l'ID
      const categoryUpdateData = {
        id: categoryId, // Ajouter l'ID
        name: data.name,
        description: data.description || "Aucune description fournie",
      }

      const updatedCategory = await updateCategory(categoryUpdateData)

      const formattedCategory: Category = {
        id: updatedCategory.id,
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        description: updatedCategory.description,
        createdAt: new Date(updatedCategory.createdAt),
        updatedAt: new Date(updatedCategory.updatedAt),
      }

      // Mise à jour du cache React Query
      queryClient.setQueryData<Category[]>(['categories'], (old = []) =>
        old ? old.map(c => c.id === categoryId ? formattedCategory : c) : []
      )

      // Mise à jour du cache pour la catégorie spécifique
      queryClient.setQueryData(['category', categoryId], formattedCategory)

      // Invalidation des queries pour forcer le rechargement
      await queryClient.invalidateQueries({ queryKey: ['categories'] })

      setMessage('Category updated successfully', 'success')
      router.push('/dashboard/categories')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      setMessage(errorMessage, 'error')
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  // État de chargement
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-full">
          <PageHeader
            breadcrumb={['Category', 'Edit category']}
            title="Category management"
          />
          <div className={`
            rounded-lg p-6 shadow-sm transition-all duration-300 flex justify-center items-center h-64
            ${isDarkMode
              ? 'bg-gray-800/90 border border-gray-700 shadow-gray-900/20'
              : 'bg-white border border-gray-200 shadow-gray-100/50'
            }
          `}>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading category...
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className='max-w-full'>
        <PageHeader
          breadcrumb={['Category', 'Edit category']}
          title='Category management'
        />
       
        {/* Container principal avec support du thème sombre */}
        <div className={`
          rounded-lg p-6 shadow-sm transition-all duration-300
          ${isDarkMode
            ? 'bg-gray-800/90 border border-gray-700 shadow-gray-900/20'
            : 'bg-white border border-gray-200 shadow-gray-100/50'
          }
        `}>
          {category && (
            <CategoryForm
              onSubmit={onSubmit}
              initialData={category}
              isSubmitting={isSubmitting}
              submitButtonText='Update category'
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}