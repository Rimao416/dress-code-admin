// hooks/products/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getProducts } from '@/services/product.service';
import { useProductStore } from '@/store/productStore';

export const useProducts = () => {
  const { products, setProducts, setError, setLoading } = useProductStore();
 
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    setLoading(isLoading || isFetching);
  }, [isLoading, isFetching, setLoading]);

  useEffect(() => {
    if (data) {
      const formattedData = data.map(product => ({
        ...product,
        createdAt: new Date(product.createdAt),
        // Formatage des dates si nécessaire
      }));
      setProducts(formattedData);
    }
  }, [data, setProducts]);

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
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