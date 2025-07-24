import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCategoryStore } from '@/store/categoryStore';
import { getCategoryById } from '@/services/category.service';

export const useCategory = (id: string) => {
  const {
    selectCategory,
    selectedCategory,
    setLoading,
    setError,
  } = useCategoryStore();

  const isValidId = !!id && id.trim() !== '';

  const query = useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategoryById(id),
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
      selectCategory(data);
    }
  }, [data, selectCategory]);

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(message);
    }
  }, [error, setError]);

  return {
    ...query,
    data: selectedCategory,
  };
};
