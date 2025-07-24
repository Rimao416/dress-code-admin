// useDeleteCategory.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '@/services/category.service';

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  // Mutation pour supprimer une catégorie unique
  const deleteSingleMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.removeQueries({ queryKey: ['category', id] });
    },
  });

  // Fonction unifiée pour supprimer un ou plusieurs éléments
  const deleteCategories = (
    idsToDelete: string | string[],
    options?: { onSuccess?: () => void; onError?: (err: any) => void }
  ) => {
    if (Array.isArray(idsToDelete)) {
      if (idsToDelete.length === 1) {
        return deleteSingleMutation.mutate(idsToDelete[0], options);
      }
      // TODO: ajouter mutation multiple si besoin
    } else {
      return deleteSingleMutation.mutate(idsToDelete, options);
    }
  };

  return {
    mutate: deleteCategories,
    isPending: deleteSingleMutation.isPending,
  };
};
