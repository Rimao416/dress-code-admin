// pages/add-product/page.tsx
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

interface ExtendedProductFormData extends ProductFormData {
  imageUrls?: string[];
}

const generateSKU = (productName: string): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SKU-${timestamp}-${randomStr}`;
};

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export default function AddProductPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setMessage } = useMessages()
  const { setLoading, setError } = useProductStore()
  const { isDarkMode } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: categories = [] } = useCategories()

  const onSubmit = async (data: ExtendedProductFormData) => {
    console.log('=== DÉBUT SOUMISSION ===');
    console.log('Data reçue:', data);
    
    setIsSubmitting(true)
    setLoading(true)
   
    try {
      if (!data.imageUrls || data.imageUrls.length === 0) {
        console.error('Aucune image fournie');
        throw new Error('Au moins une image est requise pour le produit');
      }

      console.log('Images URLs:', data.imageUrls);

      const finalCategoryId = data.subcategoryId || data.categoryId;

      const productData: CreateProductData = {
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: finalCategoryId,
        stock: data.stock,
        available: data.available,
        images: data.imageUrls,
        sku: generateSKU(data.name),
        variants: data.variants.map(v => ({
          size: v.size,
          color: v.color,
          quantity: v.quantity
        }))
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
        stock: newProduct.stock,
        available: newProduct.available,
        sku: newProduct.sku,
        images: newProduct.images || [],
        category: newProduct.category,
        slug: generateSlug(newProduct.name),
        createdAt: new Date(newProduct.createdAt),
        updatedAt: new Date(newProduct.updatedAt),
      }
       
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
            categories={categories}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}