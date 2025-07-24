// hooks/products/useProductsByCategory.ts
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getProductsByCategory } from '@/services/product.service';
import { useProductStore } from '@/store/productStore';

export const useProductsByCategory = (categoryId: string) => {
  const { setError, setLoading } = useProductStore();

  const isValidId = !!categoryId && categoryId.trim() !== '';

  const query = useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => getProductsByCategory(categoryId),
    enabled: isValidId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = query;

  useEffect(() => {
    setLoading(isLoading || isFetching);
  }, [isLoading, isFetching, setLoading]);

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      setError(message);
    }
  }, [error, setError]);

  return {
    data: data || [],
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

// hooks/products/useProductsBySubCategory.ts
export const useProductsBySubCategory = (subcategoryId: string) => {
  const { setError, setLoading } = useProductStore();

  const isValidId = !!subcategoryId && subcategoryId.trim() !== '';

  const query = useQuery({
    queryKey: ['products', 'subcategory', subcategoryId],
    queryFn: () => getProductsBySubCategory(subcategoryId),
    enabled: isValidId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = query;

  useEffect(() => {
    setLoading(isLoading || isFetching);
  }, [isLoading, isFetching, setLoading]);

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      setError(message);
    }
  }, [error, setError]);

  return {
    data: data || [],
    isLoading,
    isFetching,
    error,
    refetch,
  };
};