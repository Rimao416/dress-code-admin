// hooks/products/useProduct.ts
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/services/product.service';
import { useProductStore } from '@/store/productStore';

export const useProduct = (id: string) => {
  const {
    selectProduct,
    selectedProduct,
    setLoading,
    setError,
  } = useProductStore();

  const isValidId = !!id && id.trim() !== '';

  const query = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: isValidId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const {
    data,
    error,
    isLoading,
    isFetching,
  } = query;

  useEffect(() => {
    setLoading(isLoading || isFetching);
  }, [isLoading, isFetching, setLoading]);

  useEffect(() => {
    if (data) {
      const formattedData = {
        ...data,
        createdAt: new Date(data.createdAt),
      };
      selectProduct(formattedData);
    }
  }, [data, selectProduct]);

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(message);
    }
  }, [error, setError]);

  return {
    ...query,
    data: selectedProduct,
  };
};