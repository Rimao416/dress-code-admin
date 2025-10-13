'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { brandSchema, BrandFormData } from '@/schemas/brandSchema'
import { Brand } from '@/types/brand.type'
import { useTheme } from '@/context/ThemeContext'
import { Upload, X } from 'lucide-react'
import { useState } from 'react'

interface BrandFormProps {
  onSubmit: (data: BrandFormData) => Promise<void>
  initialData?: Brand
  isSubmitting?: boolean
  submitButtonText?: string
}

export default function BrandForm({
  onSubmit,
  initialData,
  isSubmitting = false,
  submitButtonText = 'Enregistrer',
}: BrandFormProps) {
  const { isDarkMode } = useTheme()
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialData?.logo || null
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      logo: initialData?.logo || '',
      website: initialData?.website || '',
      isActive: initialData?.isActive ?? true,
    },
  })

  const logo = watch('logo')

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue('logo', value)
    setLogoPreview(value || null)
  }

  const handleRemoveLogo = () => {
    setValue('logo', '')
    setLogoPreview(null)
  }

  const inputClass = `
    w-full px-4 py-2.5 rounded-lg border transition-all duration-200
    ${isDarkMode
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
    }
    ${errors ? 'border-red-500' : ''}
  `

  const labelClass = `
    block text-sm font-medium mb-2
    ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}
  `

  const errorClass = 'text-red-500 text-sm mt-1'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nom de la marque */}
      <div>
        <label htmlFor="name" className={labelClass}>
          Nom de la marque <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className={inputClass}
          placeholder="Ex: Nike, Adidas..."
        />
        {errors.name && (
          <p className={errorClass}>{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          className={inputClass}
          rows={4}
          placeholder="Description de la marque..."
        />
        {errors.description && (
          <p className={errorClass}>{errors.description.message}</p>
        )}
      </div>

      {/* Logo */}
      <div>
        <label htmlFor="logo" className={labelClass}>
          Logo (URL)
        </label>
        <div className="space-y-3">
          <input
            id="logo"
            type="url"
            {...register('logo')}
            onChange={handleLogoChange}
            className={inputClass}
            placeholder="https://example.com/logo.png"
          />
          {errors.logo && (
            <p className={errorClass}>{errors.logo.message}</p>
          )}
          
          {/* Aperçu du logo */}
          {logoPreview && (
            <div className={`
              relative inline-block p-4 rounded-lg border
              ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
            `}>
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-20 w-20 object-contain"
                onError={() => setLogoPreview(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Site web */}
      <div>
        <label htmlFor="website" className={labelClass}>
          Site web
        </label>
        <input
          id="website"
          type="url"
          {...register('website')}
          className={inputClass}
          placeholder="https://www.example.com"
        />
        {errors.website && (
          <p className={errorClass}>{errors.website.message}</p>
        )}
      </div>

      {/* Statut actif */}
      <div className="flex items-center space-x-3">
        <input
          id="isActive"
          type="checkbox"
          {...register('isActive')}
          className={`
            w-5 h-5 rounded border transition-colors cursor-pointer
            ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500'
              : 'bg-white border-gray-300 text-blue-600 focus:ring-blue-500'
            }
          `}
        />
        <label htmlFor="isActive" className={`${labelClass} mb-0 cursor-pointer`}>
          Marque active
        </label>
      </div>

      {/* Boutons */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
          className={`
            px-6 py-2.5 rounded-lg font-medium transition-all duration-200
            ${isDarkMode
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            px-6 py-2.5 rounded-lg font-medium transition-all duration-200
            bg-blue-600 text-white hover:bg-blue-700
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center space-x-2
          `}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>En cours...</span>
            </>
          ) : (
            <span>{submitButtonText}</span>
          )}
        </button>
      </div>
    </form>
  )
}