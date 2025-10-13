'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import { useBrandStore } from '@/store/brandStore'
import { Brand } from '@/types/brand.type'
import BrandForm from '@/components/forms/BrandForm'
import { updateBrand } from '@/services/brand.service'
import { useMessages } from '@/context/useMessage'
import { BrandFormData } from '@/schemas/brandSchema'
import { useBrand } from '@/hooks/brands/useBrand'
import { useTheme } from '@/context/ThemeContext'

export default function EditBrandPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setMessage } = useMessages()
  const { setLoading, setError } = useBrandStore()
  const { isDarkMode } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)
 
  const brandId = params.id as string
  
  // Vérification de l'ID et redirection si invalide
  useEffect(() => {
    if (!brandId) {
      setMessage('ID de marque invalide', 'error')
      router.push('/dashboard/brands')
    }
  }, [brandId, router, setMessage])

  const {
    data: brand,
    isLoading,
    status,
  } = useBrand(brandId)

  // Gestion des erreurs de chargement
  useEffect(() => {
    if (status === 'error') {
      setMessage('Marque non trouvée', 'error')
      router.push('/dashboard/brands')
    }
  }, [status, router, setMessage])

  const onSubmit = async (data: BrandFormData) => {
    if (!brand) return
    
    setIsSubmitting(true)
    setLoading(true)
    
    try {
      const brandUpdateData = {
        id: brandId,
        name: data.name,
        description: data.description || null,
        logo: data.logo || null,
        website: data.website || null,
        isActive: data.isActive ?? true,
      }

      console.log('Données envoyées à l\'API:', brandUpdateData)

      const updatedBrand = await updateBrand(brandUpdateData)

      const formattedBrand: Brand = {
        id: updatedBrand.id,
        name: updatedBrand.name,
        description: updatedBrand.description,
        logo: updatedBrand.logo,
        website: updatedBrand.website,
        isActive: updatedBrand.isActive,
        createdAt: new Date(updatedBrand.createdAt),
        updatedAt: new Date(updatedBrand.updatedAt),
        _count: updatedBrand._count
      }

      // Mise à jour du cache React Query
      queryClient.setQueryData<Brand[]>(['brands'], (old = []) =>
        old ? old.map(b => b.id === brandId ? formattedBrand : b) : []
      )

      // Mise à jour du cache pour la marque spécifique
      queryClient.setQueryData(['brand', brandId], formattedBrand)

      // Invalidation des queries pour forcer le rechargement
      await queryClient.invalidateQueries({ queryKey: ['brands'] })
      await queryClient.invalidateQueries({ queryKey: ['brand', brandId] })

      setMessage('Marque mise à jour avec succès', 'success')
      router.push('/dashboard/brands')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Une erreur inconnue est survenue'
      setError(errorMessage)
      setMessage(errorMessage, 'error')
      console.error('Erreur lors de la mise à jour:', err)
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
            breadcrumb={['Marques', 'Modifier la marque']}
            title="Gestion des marques"
          />
          <div className={`
            rounded-lg p-6 shadow-sm transition-all duration-300 flex justify-center items-center h-64
            ${isDarkMode
              ? 'bg-gray-800/90 border border-gray-700 shadow-gray-900/20'
              : 'bg-white border border-gray-200 shadow-gray-100/50'
            }
          `}>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Chargement de la marque...
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
          breadcrumb={['Marques', 'Modifier la marque']}
          title='Gestion des marques'
        />
       
        <div className={`
          rounded-lg p-6 shadow-sm transition-all duration-300
          ${isDarkMode
            ? 'bg-gray-800/90 border border-gray-700 shadow-gray-900/20'
            : 'bg-white border border-gray-200 shadow-gray-100/50'
          }
        `}>
          {brand && (
            <BrandForm
              onSubmit={onSubmit}
              initialData={brand}
              isSubmitting={isSubmitting}
              submitButtonText='Mettre à jour la marque'
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}