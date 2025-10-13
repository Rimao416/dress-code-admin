'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import { Brand } from '@/types/brand.type'
import BrandForm from '@/components/forms/BrandForm'
import { createBrand } from '@/services/brand.service'
import { useMessages } from '@/context/useMessage'
import { BrandFormData } from '@/schemas/brandSchema'
import { useTheme } from '@/context/ThemeContext'
import { useBrandStore } from '@/store/brandStore'

export default function AddBrandPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setMessage } = useMessages()
  const { setLoading, setError } = useBrandStore()
  const { isDarkMode } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: BrandFormData) => {
    setIsSubmitting(true)
    setLoading(true)
    
    try {
      const newBrand = await createBrand({
        name: data.name,
        description: data.description || null,
        logo: data.logo || null,
        website: data.website || null,
        isActive: data.isActive ?? true,
      })
     
      const formattedBrand: Brand = {
        id: newBrand.id,
        name: newBrand.name,
        description: newBrand.description,
        logo: newBrand.logo,
        website: newBrand.website,
        isActive: newBrand.isActive,
        createdAt: new Date(newBrand.createdAt),
        updatedAt: new Date(newBrand.updatedAt),
        _count: newBrand._count,
      }
     
      // Mise à jour du cache React Query
      queryClient.setQueryData<Brand[]>(['brands'], (old = []) => [
        ...old,
        formattedBrand,
      ])

      // Invalider et refetch les requêtes liées aux marques
      queryClient.invalidateQueries({ queryKey: ['brands'] })
     
      setMessage('Marque créée avec succès', 'success')
      router.push('/dashboard/brands')
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
          breadcrumb={['Marques', 'Ajouter une nouvelle marque']}
          title='Gestion des marques'
        />
       
        {/* Main container with dark theme support */}
        <div className={`
          rounded-lg p-6 shadow-sm transition-all duration-300
          ${isDarkMode
            ? 'bg-gray-800/90 border border-gray-700 shadow-gray-900/20'
            : 'bg-white border border-gray-200 shadow-gray-100/50'
          }
        `}>
          <BrandForm
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitButtonText='Ajouter la marque'
          />
        </div>
      </div>
    </DashboardLayout>
  )
}