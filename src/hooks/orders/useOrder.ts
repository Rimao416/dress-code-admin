// =============================================
// hooks/orders/useOrder.ts
// =============================================

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/services/order.service';
import { useOrderStore } from '@/store/orderStore';

export const useOrder = (id: string) => {
  const {
    selectOrder,
    selectedOrder,
    setLoading,
    setError,
  } = useOrderStore();

  const isValidId = !!id && id.trim() !== '';

  const query = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id),
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
      const formattedData = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
      selectOrder(formattedData);
    }
  }, [data, selectOrder]);

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(message);
    }
  }, [error, setError]);

  return {
    ...query,
    data: selectedOrder,
  };
};