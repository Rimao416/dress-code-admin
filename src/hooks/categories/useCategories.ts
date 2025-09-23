// hooks/useCategories.ts

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getCategories } from '@/services/category.service';
import { useCategoryStore } from '@/store/categoryStore';

interface UseCategoriesOptions {
  hierarchy?: boolean;
  root?: boolean;
  parentId?: string;
}

export const useCategories = (options?: UseCategoriesOptions) => {
  const { categories, setCategories, setError, setLoading } = useCategoryStore();

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['categories', options], // Inclure les options dans la clé pour le cache
    queryFn: () => getCategories(options), // Wrapper fonction qui passe les options
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Met à jour l'état de chargement dans le store
  useEffect(() => {
    setLoading(isLoading || isFetching);
  }, [isLoading, isFetching, setLoading]);

  // Met à jour les catégories dans le store
  useEffect(() => {
    if (data) {
      const formattedData = data.map(category => ({
        ...category,
        // Assurer que les dates sont bien formatées si nécessaire
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      }));
      setCategories(formattedData);
    }
  }, [data, setCategories]);

  // Gère les erreurs
  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      setError(message);
    }
  }, [error, setError]);

  return {
    data: categories,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

// Hook spécialisé pour les catégories hiérarchiques
export const useCategoriesHierarchy = () => {
  return useCategories({ hierarchy: true });
};

// Hook spécialisé pour les catégories racines
export const useRootCategories = () => {
  return useCategories({ root: true });
};

// Hook spécialisé pour les enfants d'une catégorie
export const useChildrenCategories = (parentId: string) => {
  return useCategories({ parentId });
};