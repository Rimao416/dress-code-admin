// hooks/products/useDeleteProduct.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProduct } from '@/services/product.service';

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  const deleteSingleMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.removeQueries({ queryKey: ['product', id] });
    },
  });

const deleteProducts = (
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
    mutate: deleteProducts,
    isPending: deleteSingleMutation.isPending,
  };
};