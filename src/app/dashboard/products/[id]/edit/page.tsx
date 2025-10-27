  // pages/edit-product/[id]/page.tsx
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

  interface ExtendedProductFormData extends ProductFormData {
    imageUrls?: string[];
  }

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  export default function EditProductPage() {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const { setMessage } = useMessages()
    const { setLoading, setError } = useProductStore()
    const { isDarkMode } = useTheme()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [processedProduct, setProcessedProduct] = useState<Product | null>(null)
  
    const productId = params.id as string
  
    useEffect(() => {
      if (!productId) {
        setMessage('ID produit invalide', 'error')
        router.push('/dashboard/products')
      }
    }, [productId, router, setMessage])

    const {
      data: product,
      isLoading,
      status,
    } = useProduct(productId)

    const { data: categories = [] } = useCategories()
  
    useEffect(() => {
      if (status === 'error') {
        setMessage('Produit non trouvé', 'error')
        router.push('/dashboard/products')
      }
    }, [status, router, setMessage])

    // ✅ Traiter le produit pour déterminer categoryId et subcategoryId
    useEffect(() => {
      if (!product || categories.length === 0) return;

      const categoryData = categories.find(cat => cat.id === product.categoryId);
      
      let finalCategoryId = product.categoryId;
      let finalSubcategoryId: string | undefined = undefined;

      // Si la catégorie chargée a un parentId, c'est une sous-catégorie
      if (categoryData?.parentId) {
        finalSubcategoryId = product.categoryId;
        finalCategoryId = categoryData.parentId;
      } else {
        // Sinon, c'est une catégorie parente
        finalCategoryId = product.categoryId;
        finalSubcategoryId = undefined;
      }

      // Créer le produit traité avec les bonnes valeurs
      const processed: Product = {
        ...product,
        categoryId: finalCategoryId,
        // Ajouter subcategoryId s'il existe
        ...(finalSubcategoryId && { subcategoryId: finalSubcategoryId }),
      };

      console.log('Produit traité:', {
        categoryId: finalCategoryId,
        subcategoryId: finalSubcategoryId,
        originalCategoryId: product.categoryId,
      });

      setProcessedProduct(processed);
    }, [product, categories]);

    const onSubmit = async (data: ExtendedProductFormData) => {
      console.log('=== DÉBUT MISE À JOUR ===');
      console.log('Data reçue:', data);
      
      if (!product) return
  
      setIsSubmitting(true)
      setLoading(true)
  
      try {
        if (!data.imageUrls || data.imageUrls.length === 0) {
          console.error('Aucune image fournie');
          throw new Error('Au moins une image est requise pour le produit');
        }
        
        console.log('Images URLs:', data.imageUrls);

        // ✅ Utiliser subcategoryId si fourni, sinon categoryId
        const finalCategoryId = data.subcategoryId || data.categoryId;

        const productUpdateData: UpdateProductData = {
          id: productId,
          name: data.name,
          description: data.description,
          price: data.price,
          categoryId: finalCategoryId,
          subcategoryId: data.subcategoryId,
          brandId: data.brandId,
          stock: data.stock,
          available: data.available,
          images: data.imageUrls,
          sku: product.sku,
          variants: data.variants.map(v => ({
            size: v.size,
            color: v.color,
            quantity: v.quantity
          }))
        }
        
        console.log('Données envoyées à l\'API:', productUpdateData);
    
        const updatedProduct = await updateProduct(productUpdateData)
        console.log('Produit mis à jour:', updatedProduct);
      
        const categoryData = categories.find(cat => cat.id === updatedProduct.categoryId)
    
        const formattedProduct: Product = {
          id: updatedProduct.id,
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          categoryId: updatedProduct.categoryId,
          stock: updatedProduct.stock,
          available: updatedProduct.available,
          sku: updatedProduct.sku,
          images: updatedProduct.images || [],
          slug: updatedProduct.slug || generateSlug(updatedProduct.name),
          createdAt: new Date(updatedProduct.createdAt),
          updatedAt: new Date(updatedProduct.updatedAt),
          category: categoryData ? {
            id: categoryData.id,
            name: categoryData.name,
            slug: categoryData.slug,
          } : undefined,
          variants: updatedProduct.variants || [],
        }
    
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
        
          <div className={`
            rounded-lg p-6 shadow-sm transition-all duration-300
            ${isDarkMode
              ? 'bg-gray-800/90 border border-gray-700 shadow-gray-900/20'
              : 'bg-white border border-gray-200 shadow-gray-100/50'
            }
          `}>
            {processedProduct && (
              <ProductForm
                onSubmit={onSubmit}
                initialData={processedProduct}
                isSubmitting={isSubmitting}
                submitButtonText='Mettre à jour le produit'
                categories={categories}
              />
            )}
          </div>
        </div>
      </DashboardLayout>
    )
  }