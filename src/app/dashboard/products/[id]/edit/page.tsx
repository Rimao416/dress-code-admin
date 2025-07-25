'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import { useProductStore } from '@/store/productStore'
import { Product, UpdateProductData } from '@/types/product.type'
import ProductForm from '@/components/forms/ProductForm'
import { useMessages } from '@/context/useMessage'
import { ProductFormData } from '@/schemas/productSchema'
import { useProduct } from '@/hooks/products/useProduct'
import { useCategories } from '@/hooks/categories/useCategories'
import { useTheme } from '@/context/ThemeContext'
import { updateProduct } from '@/services/product.service'
import { useSubCategories } from '@/hooks/subCategories/useSubCategories'

// Interface étendue pour inclure les URLs Cloudinary (même que dans add-product)
interface ExtendedProductFormData extends ProductFormData {
  imageUrls?: string[];
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setMessage } = useMessages()
  const { setLoading, setError } = useProductStore()
  const { isDarkMode } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)
 
  const productId = params.id as string
 
  // Vérification de l'ID et redirection si invalide
  useEffect(() => {
    if (!productId) {
      setMessage('Invalid product ID', 'error')
      router.push('/dashboard/products')
    }
  }, [productId, router, setMessage])

  const {
    data: product,
    isLoading,
    status,
  } = useProduct(productId)

  // Récupération des catégories et sous-catégories
  const { data: categories = [] } = useCategories()
  const { data: subcategories = [] } = useSubCategories()
 
  // Gestion des erreurs de chargement
  useEffect(() => {
    if (status === 'error') {
      setMessage('Product not found', 'error')
      router.push('/dashboard/products')
    }
  }, [status, router, setMessage])

  const onSubmit = async (data: ExtendedProductFormData) => {
    console.log('=== DÉBUT MISE À JOUR ===');
    console.log('Data reçue:', data);
    
    if (!product) return
 
    setIsSubmitting(true)
    setLoading(true)
 
    try {
      // Vérifier que nous avons au moins une image (soit uploadée, soit existante)
      const finalImageUrls = data.imageUrls || product.images || []
      if (finalImageUrls.length === 0) {
        console.error('Aucune image fournie');
        throw new Error('Au moins une image est requise pour le produit');
      }
      
      console.log('Images URLs finales:', finalImageUrls);

      // Préparer les données de mise à jour avec les URLs Cloudinary
      const productUpdateData: UpdateProductData = {
        id: productId,
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || null,
        stock: data.stock,
        available: data.available,
        variants: data.variants || [],
        images: finalImageUrls // Utiliser les URLs Cloudinary
      }
      
      console.log('Données envoyées à l\'API:', productUpdateData);
   
      const updatedProduct = await updateProduct(productUpdateData)
      console.log('Produit mis à jour:', updatedProduct);
     
      // Récupérer la catégorie pour construire l'objet Product complet
      const categoryData = categories.find(cat => cat.id === updatedProduct.categoryId)
   
      const formattedProduct: Product = {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        categoryId: updatedProduct.categoryId,
        subcategoryId: updatedProduct.subcategoryId,
        stock: updatedProduct.stock,
        available: updatedProduct.available,
        variants: updatedProduct.variants || [],
        images: updatedProduct.images || [],
        createdAt: new Date(updatedProduct.createdAt),
        category: {
          id: categoryData?.id || updatedProduct.categoryId,
          name: categoryData?.name || 'Unknown Category'
        }
      }
   
      // Mise à jour du cache React Query
      queryClient.setQueryData<Product[]>(['products'], (old = []) =>
        old ? old.map(p => p.id === productId ? formattedProduct : p) : []
      )
   
      queryClient.setQueryData(['product', productId], formattedProduct)
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      
      setMessage('Produit mis à jour avec succès', 'success')
      router.push('/dashboard/products')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue s\'est produite'
      console.error('Error updating product:', err);
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
            breadcrumb={['Produits', 'Modifier le produit']}
            title="Gestion des produits"
          />
          <div className={`
            rounded-lg p-6 shadow-sm transition-all duration-300 flex justify-center items-center h-64
            ${isDarkMode
              ? 'bg-gray-800/90 border border-gray-700 shadow-gray-900/20'
              : 'bg-white border border-gray-200 shadow-gray-100/50'
            }
          `}>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Chargement du produit...
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
          breadcrumb={['Produits', 'Modifier le produit']}
          title='Gestion des produits'
        />
       
        {/* Container principal avec support du thème sombre */}
        <div className={`
          rounded-lg p-6 shadow-sm transition-all duration-300
          ${isDarkMode
            ? 'bg-gray-800/90 border border-gray-700 shadow-gray-900/20'
            : 'bg-white border border-gray-200 shadow-gray-100/50'
          }
        `}>
          {product && (
            <ProductForm
              onSubmit={onSubmit}
              initialData={product}
              isSubmitting={isSubmitting}
              submitButtonText='Mettre à jour le produit'
              categories={categories.map(cat => ({ id: cat.id, name: cat.name }))}
              subcategories={subcategories.map(sub => ({
                id: sub.id,
                name: sub.name,
                categoryId: sub.categoryId
              }))}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}