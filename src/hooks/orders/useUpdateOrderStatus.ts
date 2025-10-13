import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Order, OrderStatus, PaymentStatus } from '@/types/order.type';
import { updateOrder } from '@/services/order.service';

interface UpdateOrderStatusParams {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, paymentStatus }: UpdateOrderStatusParams) => {
      const response = await updateOrder({
        id: orderId,
        status,
        paymentStatus,
      });
      return response;
    },
    onSuccess: (data: Order) => {
      // Invalider et refetch les requêtes pertinentes
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      
      console.log('Commande mise à jour avec succès:', data);
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du statut:', error);
    },
  });
};