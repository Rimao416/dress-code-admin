// pages/add-product/page.tsx (version mise à jour)
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import { useProductStore } from '@/store/productStore'
import { CreateProductData, Product } from '@/types/product.type'
import ProductForm from '@/components/forms/ProductForm'
import { useMessages } from '@/context/useMessage'
import { ProductFormData } from '@/schemas/productSchema'
import { useTheme } from '@/context/ThemeContext'
import { useCategories } from '@/hooks/categories/useCategories'
import { createProduct } from '@/services/product.service'
import { useSubCategories } from '@/hooks/subCategories/useSubCategories'

// Interface étendue pour inclure les URLs Cloudinary
interface ExtendedProductFormData extends ProductFormData {
  imageUrls?: string[];
}

export default function AddProductPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setMessage } = useMessages()
  const { setLoading, setError } = useProductStore()
  const { isDarkMode } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Récupération des catégories et sous-catégories
  const { data: categories = [] } = useCategories()
  const { data: subcategories = [] } = useSubCategories()

const onSubmit = async (data: ExtendedProductFormData) => {
  console.log('=== DÉBUT SOUMISSION ===');
  console.log('Data reçue:', data);
  
  setIsSubmitting(true)
  setLoading(true)
 
  try {
    // Vérifier que nous avons au moins une image uploadée
    if (!data.imageUrls || data.imageUrls.length === 0) {
      console.error('Aucune image fournie');
      throw new Error('Au moins une image est requise pour le produit');
    }

    console.log('Images URLs:', data.imageUrls);

    // Préparer les données du produit avec les URLs Cloudinary
    const productData: CreateProductData = {
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      stock: data.stock,
      available: data.available,
      variants: data.variants || [],
      images: data.imageUrls
    }

    console.log('Données envoyées à l\'API:', productData);
    
    const newProduct = await createProduct(productData)
    console.log('Produit créé:', newProduct);
     
      const formattedProduct: Product = {
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        categoryId: newProduct.categoryId,
        subcategoryId: newProduct.subcategoryId,
        stock: newProduct.stock,
        available: newProduct.available,
        variants: newProduct.variants || [],
        images: newProduct.images || [],
        category: newProduct.category,
        createdAt: new Date(newProduct.createdAt),
      }
     
      // Mise à jour du cache React Query
      queryClient.setQueryData<Product[]>(['products'], (old = []) => [
        ...old,
        formattedProduct,
      ])
     
      setMessage('Produit créé avec succès', 'success')
      router.push('/dashboard/products')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue s\'est produite'
      console.error('Error creating product:', err);
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
          breadcrumb={['Produits', 'Ajouter un nouveau produit']}
          title='Gestion des produits'
        />
       
        {/* Main container with dark theme support */}
        <div className={`
          rounded-lg p-6 shadow-sm transition-all duration-300
          ${isDarkMode
            ? 'bg-gray-800/90 border border-gray-700 shadow-gray-900/20'
            : 'bg-white border border-gray-200 shadow-gray-100/50'
          }
        `}>
          <ProductForm
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitButtonText='Ajouter le produit'
            categories={categories.map(cat => ({ id: cat.id, name: cat.name }))}
            subcategories={subcategories.map(sub => ({
              id: sub.id,
              name: sub.name,
              categoryId: sub.categoryId
            }))}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}