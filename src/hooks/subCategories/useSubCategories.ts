import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getSubCategories } from '@/services/subCategory.service';
import useSubCategoryStore from '@/store/subCategoryStore';

export const useSubCategories = () => {
  const { subCategories, setSubCategories, setError, setLoading } = useSubCategoryStore();

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['subcategories'],
    queryFn: getSubCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    setLoading(isLoading || isFetching);
  }, [isLoading, isFetching, setLoading]);

  useEffect(() => {
    if (data) {
      const formattedData = data.map(subCategory => ({
        ...subCategory,
        // createdAt: new Date(subCategory.createdAt).toISOString(),
        // updatedAt: new Date(subCategory.updatedAt).toISOString(),
      }));
      setSubCategories(formattedData);
    }
  }, [data, setSubCategories]);

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      setError(message);
    }
  }, [error, setError]);

  return {
    data: subCategories,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
