// =============================================
// hooks/orders/useDeleteOrder.ts
// =============================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteOrder } from '@/services/order.service';

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  const deleteSingleMutation = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.removeQueries({ queryKey: ['order', id] });
    },
  });

  const deleteOrders = (
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
    mutate: deleteOrders,
    isPending: deleteSingleMutation.isPending,
  };
};