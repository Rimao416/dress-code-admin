'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import { useCategoryStore } from '@/store/categoryStore'
import { Category } from '@/types/category.type'
import CategoryForm from '@/components/forms/CategoryForm'
import { createCategory } from '@/services/category.service'
import { useMessages } from '@/context/useMessage'
import { CategoryFormData } from '@/schemas/category.schema'
import { useTheme } from '@/context/ThemeContext'

export default function AddCategoryPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setMessage } = useMessages()
  const { setLoading, setError } = useCategoryStore()
  const { isDarkMode } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    setLoading(true)
    try {
      const newCategory = await createCategory({
        name: data.name,
        description: data.description || "Aucune description fournie",
      })
      
      const formattedCategory: Category = {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,      
        createdAt: new Date(newCategory.createdAt),
        updatedAt: new Date(newCategory.updatedAt),
      }
      
      // Mise à jour du cache React Query
      queryClient.setQueryData<Category[]>(['categories'], (old = []) => [
        ...old,
        formattedCategory,
      ])
      
      setMessage('Category created successfully', 'success')
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

  return (
  <DashboardLayout>
  <div className='max-w-full'>
    <PageHeader
      breadcrumb={['Catégorie', 'Ajouter une nouvelle catégorie']}
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