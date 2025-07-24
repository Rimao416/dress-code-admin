'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { SubCategory } from '@/types/subCategory.type'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import useSubCategoryStore from '@/store/subCategoryStore'
import PageHeader from '@/components/common/PageHeader'
import SubCategoryForm from '@/components/forms/SubCategoryForm'
import { createSubCategory } from '@/services/subCategory.service'
import { useMessages } from '@/context/useMessage'
import {  SubCategoryFormData } from '@/schemas/subCategory.schema'
import { useTheme } from '@/context/ThemeContext'

export default function AddSubCategoryPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setMessage } = useMessages()
  const { setLoading, setError } = useSubCategoryStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isDarkMode } = useTheme()
  const onSubmit = async (data: SubCategoryFormData) => {
    setIsSubmitting(true)
    setLoading(true)
    try {
      const newSubCategory = await createSubCategory({
        name: data.name,
        categoryId: data.categoryId,
      })

      const formattedSubCategory: SubCategory = {
        id: newSubCategory.id,
        name: newSubCategory.name,
        categoryId: newSubCategory.categoryId,
        // createdAt: new Date(newSubCategory.createdAt),
        // updatedAt: new Date(newSubCategory.updatedAt),
        category: {
          id: newSubCategory.category.id,
          name: newSubCategory.category.name,
        },
      }

      queryClient.setQueryData<SubCategory[]>(['subCategories'], (old = []) => [
        ...old,
        formattedSubCategory,
      ])

      setMessage('Sub-category created successfully', 'success')
      router.push('/dashboard/sub-categories')
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
      breadcrumb={['Sous-catégorie', 'Ajouter une nouvelle sous-catégorie']}
      title='Gestion des sous-catégories'
    />
    <div className={`
      rounded-lg p-6 shadow-sm transition-all duration-300
      ${isDarkMode 
        ? 'bg-gray-800/90 border border-gray-700 shadow-gray-900/20' 
        : 'bg-white border border-gray-200 shadow-gray-100/50'
      }
    `}>
      <SubCategoryForm
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitButtonText='Ajouter la sous-catégorie'
      />
    </div>
  </div>
</DashboardLayout>
  )
}