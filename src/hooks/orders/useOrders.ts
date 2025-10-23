// =============================================
// hooks/orders/useOrders.ts
// =============================================

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getOrders } from '@/services/order.service';
import { useOrderStore } from '@/store/orderStore';
import { OrderStatus, PaymentStatus } from '@/generated/prisma';
interface UseOrdersOptions {
  clientId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const useOrders = (options?: UseOrdersOptions) => {
  const { orders, setOrders, setError, setLoading } = useOrderStore();

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['orders', options],
    queryFn: () => getOrders(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    setLoading(isLoading || isFetching);
  }, [isLoading, isFetching, setLoading]);

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      const formattedData = data.map(order => ({
        ...order,
        createdAt: typeof order.createdAt === 'string' 
          ? new Date(order.createdAt) 
          : order.createdAt,
        updatedAt: typeof order.updatedAt === 'string' 
          ? new Date(order.updatedAt) 
          : order.updatedAt,
      }));
      console.log('Commandes formatées et stockées:', formattedData);
      setOrders(formattedData);
    } else if (data && Array.isArray(data) && data.length === 0) {
      setOrders([]);
    }
  }, [data, setOrders]);

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      console.error('Erreur commandes:', message);
      setError(message);
    }
  }, [error, setError]);

  return {
    data: orders,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};