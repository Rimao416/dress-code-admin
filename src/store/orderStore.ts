// =============================================
// store/orderStore.ts
// =============================================

import { create } from 'zustand';
import { Order, OrderStatus, PaymentStatus } from '@/types/order.type';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (updatedOrder: Order) => void;
  deleteOrder: (id: string) => void;
  selectOrder: (order: Order | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Helper methods
  getOrderById: (id: string) => Order | undefined;
  getOrdersByClient: (clientId: string) => Order[];
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByPaymentStatus: (paymentStatus: PaymentStatus) => Order[];
  searchOrders: (query: string) => Order[];
  getRecentOrders: (limit?: number) => Order[];
  getTotalRevenue: () => number;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  setOrders: (orders) => set({ orders }),
  
  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),

  updateOrder: (updatedOrder) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      ),
      selectedOrder: state.selectedOrder?.id === updatedOrder.id 
        ? updatedOrder 
        : state.selectedOrder,
    })),

  deleteOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id),
      selectedOrder: state.selectedOrder?.id === id ? null : state.selectedOrder,
    })),

  selectOrder: (order) => set({ selectedOrder: order }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Helper methods
  getOrderById: (id: string) => {
    const { orders } = get();
    return orders.find(order => order.id === id);
  },

  getOrdersByClient: (clientId: string) => {
    const { orders } = get();
    return orders.filter(order => order.clientId === clientId);
  },

  getOrdersByStatus: (status: OrderStatus) => {
    const { orders } = get();
    return orders.filter(order => order.status === status);
  },

  getOrdersByPaymentStatus: (paymentStatus: PaymentStatus) => {
    const { orders } = get();
    return orders.filter(order => order.paymentStatus === paymentStatus);
  },

  searchOrders: (query: string) => {
    const { orders } = get();
    const lowerQuery = query.toLowerCase();
    return orders.filter(order =>
      order.orderNumber.toLowerCase().includes(lowerQuery) ||
      order.client?.email?.toLowerCase().includes(lowerQuery) ||
      order.client?.firstName?.toLowerCase().includes(lowerQuery) ||
      order.client?.lastName?.toLowerCase().includes(lowerQuery)
    );
  },

  getRecentOrders: (limit = 10) => {
    const { orders } = get();
    return [...orders]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
  },

  getTotalRevenue: () => {
    const { orders } = get();
    return orders
      .filter(order => order.paymentStatus === PaymentStatus.PAID)
      .reduce((total, order) => total + order.totalAmount, 0);
  },
}));