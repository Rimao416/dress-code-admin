// =============================================
// services/order.service.ts
// =============================================

import { Order, CreateOrderData, UpdateOrderData, OrderStatus, PaymentStatus } from '@/types/order.type';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface GetOrdersOptions {
  clientId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Obtenir toutes les commandes
export const getOrders = async (options?: GetOrdersOptions): Promise<Order[]> => {
  try {
    const params = new URLSearchParams();
    if (options?.clientId) params.append('clientId', options.clientId);
    if (options?.status) params.append('status', options.status);
    if (options?.paymentStatus) params.append('paymentStatus', options.paymentStatus);
    if (options?.search) params.append('search', options.search);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const response = await fetch(`${API_BASE_URL}/orders?${params}`);
    
    if (!response.ok) {
      throw new Error(`Échec de la récupération des commandes: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Réponse brute de l\'API commandes:', data);

    return data.orders || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    throw error;
  }
};

// Obtenir une commande par ID
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
   
    if (!response.ok) {
      throw new Error(`Échec de la récupération de la commande: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    throw error;
  }
};

// Créer une nouvelle commande
export const createOrder = async (data: CreateOrderData): Promise<Order> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
   
    if (!response.ok) {
      throw new Error(`Échec de la création de la commande: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    throw error;
  }
};

// Mettre à jour une commande
export const updateOrder = async (data: UpdateOrderData): Promise<Order> => {
  try {
    const { id, ...updateData } = data;
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
   
    if (!response.ok) {
      throw new Error(`Échec de la mise à jour de la commande: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    throw error;
  }
};

// Supprimer une commande
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
    });
   
    if (!response.ok) {
      throw new Error(`Échec de la suppression de la commande: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error);
    throw error;
  }
};

// Obtenir les commandes par client
export const getOrdersByClient = async (clientId: string): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/client/${clientId}`);
   
    if (!response.ok) {
      throw new Error(`Échec de la récupération des commandes du client: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes du client:', error);
    throw error;
  }
};

// Mettre à jour le statut d'une commande
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
   
    if (!response.ok) {
      throw new Error(`Échec de la mise à jour du statut: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    throw error;
  }
};