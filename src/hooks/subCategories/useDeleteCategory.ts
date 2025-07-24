// hooks/useDeleteSubCategory.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSubCategory } from '@/services/subCategory.service';

export const useDeleteSubCategory = () => {
  const queryClient = useQueryClient();

  const deleteSingleMutation = useMutation({
    mutationFn: (id: string) => deleteSubCategory(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.removeQueries({ queryKey: ['subcategory', id] });
    },
  });

  const deleteSubCategories = (
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
    mutate: deleteSubCategories,
    isPending: deleteSingleMutation.isPending,
  };
};