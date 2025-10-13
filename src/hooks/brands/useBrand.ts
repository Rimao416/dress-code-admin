// hooks/brands/useBrand.ts
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBrandById } from '@/services/brand.service';
import { useBrandStore } from '@/store/brandStore';

export const useBrand = (id: string) => {
  const {
    selectBrand,
    selectedBrand,
    setLoading,
    setError,
  } = useBrandStore();

  const isValidId = !!id && id.trim() !== '';

  const query = useQuery({
    queryKey: ['brand', id],
    queryFn: () => getBrandById(id),
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
      selectBrand(formattedData);
    }
  }, [data, selectBrand]);

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(message);
    }
  }, [error, setError]);

  return {
    ...query,
    data: selectedBrand,
  };
};