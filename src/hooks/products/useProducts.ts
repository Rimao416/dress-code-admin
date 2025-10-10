import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getProducts } from '@/services/product.service';
import { useProductStore } from '@/store/productStore';

interface UseProductsOptions {
  categoryId?: string;
  brandId?: string;
  featured?: boolean;
  search?: string;
}

export const useProducts = (options?: UseProductsOptions) => {
  const { products, setProducts, setError, setLoading } = useProductStore();
  const store=useProductStore();
  console.log(store)

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['products', options],
    queryFn: () => getProducts(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    setLoading(isLoading || isFetching);
  }, [isLoading, isFetching, setLoading]);

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      const formattedData = data.map(product => ({
        ...product,
        createdAt: typeof product.createdAt === 'string' 
          ? new Date(product.createdAt) 
          : product.createdAt,
        updatedAt: typeof product.updatedAt === 'string' 
          ? new Date(product.updatedAt) 
          : product.updatedAt,
      }));
      console.log('Produits formatés et stockés:', formattedData);
      setProducts(formattedData);
    } else if (data && Array.isArray(data) && data.length === 0) {
      setProducts([]);
    }
  }, [data, setProducts]);

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      console.error('Erreur produits:', message);
      setError(message);
    }
  }, [error, setError]);

  return {
    data: products,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};