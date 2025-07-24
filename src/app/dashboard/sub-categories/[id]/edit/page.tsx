'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { SubCategory } from '@/types/subCategory.type'
import PageHeader from '@/components/common/PageHeader'
import useSubCategoryStore from '@/store/subCategoryStore'
import SubCategoryForm from '@/components/forms/SubCategoryForm'
import { updateSubCategory } from '@/services/subCategory.service'
import { SubCategoryFormData } from '@/schemas/subCategory.schema'
import { useSubCategory } from '@/hooks/subCategories/useSubCategory'
import { useMessages } from '@/context/useMessage'
import DashboardLayout from '@/components/layouts/DashboardLayout'

export default function EditSubCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const subCategoryId = params.id as string

  useEffect(() => {
    if (!subCategoryId) {
      router.push('/dashboard/sub-categories')
    }
  }, [subCategoryId, router])

  const { setLoading, setError } = useSubCategoryStore()
  const { setMessage } = useMessages()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: subCategory,
    isLoading,
    status,
  } = useSubCategory(subCategoryId)

  useEffect(() => {
    if (status === 'error') {
      setMessage('Sous-catégorie non trouvée', 'error')
      router.push('/dashboard/sub-categories')
    }
  }, [status, router, setMessage])

  const onSubmit = async (data: SubCategoryFormData) => {
    if (!subCategory) return

    setIsSubmitting(true)
    setLoading(true)
    try {
      const subCategoryData = {
        id: subCategoryId,
        name: data.name,
        categoryId: data.categoryId,
      }

      const updatedSubCategory = await updateSubCategory(subCategoryId, subCategoryData)

      const formattedSubCategory = {
        ...updatedSubCategory,
        // createdAt: format(updatedSubCategory.createdAt, 'yyyy-MM-dd'),
        // updatedAt: format(updatedSubCategory.updatedAt, 'yyyy-MM-dd'),
      }

      queryClient.setQueryData<SubCategory[]>(['subcategories'], (old = []) =>
        old.map(sc => sc.id === subCategoryId ? formattedSubCategory : sc)
      )

      queryClient.setQueryData(['subcategory', subCategoryId], formattedSubCategory)
      await queryClient.invalidateQueries({ queryKey: ['subcategories'] })

      setMessage('Sous-catégorie mise à jour avec succès', 'success')
      router.push('/dashboard/sub-categories')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue'
      setError(errorMessage)
      setMessage(errorMessage, 'error')
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-full">
          <PageHeader
            breadcrumb={["Sous-catégorie", "Éditer une sous-catégorie"]}
            title="Gestion des sous-catégories"
          />
          <div className="bg-white rounded-lg p-6 shadow-sm flex justify-center items-center h-64">
            <p>Chargement de la sous-catégorie...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className='max-w-full'>
        <PageHeader
          breadcrumb={["Sous-catégorie", "Éditer une sous-catégorie"]}
          title='Gestion des sous-catégories'
        />
        <div className='bg-white rounded-lg p-6 shadow-sm'>
          {subCategory && (
            <SubCategoryForm
              onSubmit={onSubmit}
              initialData={subCategory}
              isSubmitting={isSubmitting}
              submitButtonText="Mettre à jour la sous-catégorie"
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}