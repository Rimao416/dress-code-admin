// hooks/brands/useDeleteBrand.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBrand } from '@/services/brand.service';

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  const deleteSingleMutation = useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.removeQueries({ queryKey: ['brand', id] });
    },
  });

  const deleteBrands = (
    idsToDelete: string | string[],
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
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
    mutate: deleteBrands,
    isPending: deleteSingleMutation.isPending,
  };
};