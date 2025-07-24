// hooks/useSubCategory.ts
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSubCategoryById } from '@/services/subCategory.service';
import useSubCategoryStore from '@/store/subCategoryStore';

export const useSubCategory = (id: string) => {
  const {
    selectSubCategory,
    selectedSubCategory,
    setLoading,
    setError,
  } = useSubCategoryStore();

  const isValidId = !!id && id.trim() !== '';

  const query = useQuery({
    queryKey: ['subcategory', id],
    queryFn: () => getSubCategoryById(id),
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
      selectSubCategory(data);
    }
  }, [data, selectSubCategory]);

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(message);
    }
  }, [error, setError]);

  return {
    ...query,
    data: selectedSubCategory,
  };
};