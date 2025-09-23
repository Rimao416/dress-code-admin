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
    status,
  } = useCategory(categoryId)

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
      // ✅ CORRECTION: Envoyer TOUTES les données du formulaire
      const categoryUpdateData = {
        id: categoryId,
        name: data.name,
        description: data.description || null,
        parentId: data.parentId || null, // ✅ Ajouter parentId
        image: data.image || null,       // ✅ Ajouter image
        isActive: data.isActive ?? true, // ✅ Ajouter isActive
        sortOrder: data.sortOrder ?? 0   // ✅ Ajouter sortOrder
      }

      console.log('Données envoyées à l\'API:', categoryUpdateData); // Debug

      const updatedCategory = await updateCategory(categoryUpdateData)

      // ✅ CORRECTION: Formater correctement toutes les données
      const formattedCategory: Category = {
        id: updatedCategory.id,
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        description: updatedCategory.description,
        parentId: updatedCategory.parentId,     // ✅ Inclure parentId
        image: updatedCategory.image,           // ✅ Inclure image
        isActive: updatedCategory.isActive,     // ✅ Inclure isActive
        sortOrder: updatedCategory.sortOrder,   // ✅ Inclure sortOrder
        createdAt: new Date(updatedCategory.createdAt),
        updatedAt: new Date(updatedCategory.updatedAt),
        // ✅ Inclure les relations si elles existent
        parent: updatedCategory.parent,
        children: updatedCategory.children,
        _count: updatedCategory._count
      }

      // Mise à jour du cache React Query
      queryClient.setQueryData<Category[]>(['categories'], (old = []) =>
        old ? old.map(c => c.id === categoryId ? formattedCategory : c) : []
      )

      // Mise à jour du cache pour la catégorie spécifique
      queryClient.setQueryData(['category', categoryId], formattedCategory)

      // Invalidation des queries pour forcer le rechargement
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      await queryClient.invalidateQueries({ queryKey: ['category', categoryId] })

      setMessage('Category updated successfully', 'success')
      router.push('/dashboard/categories')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      setMessage(errorMessage, 'error')
      console.error('Erreur lors de la mise à jour:', err); // Debug
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