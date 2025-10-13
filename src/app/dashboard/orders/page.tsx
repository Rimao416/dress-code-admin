// =============================================
// app/dashboard/orders/page.tsx
// =============================================

'use client';

import { ManagementPageConfig } from "@/types/management.type";
import { Order, OrderStatus, PaymentStatus } from "@/types/order.type";
import { Eye, Pencil, Trash2, Package, DollarSign } from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import ManagementPage from "@/components/common/ManagementPage";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useOrders } from "@/hooks/orders/useOrders";
import ActionModal from "@/components/common/ActionModal";
import { useDeleteOrder } from "@/hooks/orders/useDeleteOrder";

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-800',
  [OrderStatus.SHIPPED]: 'bg-indigo-100 text-indigo-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [OrderStatus.REFUNDED]: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'En attente',
  [OrderStatus.CONFIRMED]: 'Confirmée',
  [OrderStatus.PROCESSING]: 'En traitement',
  [OrderStatus.SHIPPED]: 'Expédiée',
  [OrderStatus.DELIVERED]: 'Livrée',
  [OrderStatus.CANCELLED]: 'Annulée',
  [OrderStatus.REFUNDED]: 'Remboursée',
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.PAID]: 'bg-green-100 text-green-800',
  [PaymentStatus.FAILED]: 'bg-red-100 text-red-800',
  [PaymentStatus.REFUNDED]: 'bg-gray-100 text-gray-800',
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'En attente',
  [PaymentStatus.PAID]: 'Payée',
  [PaymentStatus.FAILED]: 'Échouée',
  [PaymentStatus.REFUNDED]: 'Remboursée',
};

export default function OrdersPage() {
  const router = useRouter();
  const { data: orders, isLoading, isFetching, error, refetch } = useOrders();
  const { mutate: deleteOrders, isPending: isDeleting } = useDeleteOrder();

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    orderIds: string[];
    orderNumber: string;
  }>({
    isOpen: false,
    orderIds: [],
    orderNumber: '',
  });

  const handleDeleteClick = useCallback((id: string) => {
    const order = orders?.find(o => o.id === id);
    const orderNumber = order?.orderNumber || 'commande';

    setDeleteModal({
      isOpen: true,
      orderIds: [id],
      orderNumber: orderNumber,
    });
  }, [orders]);

  const handleConfirmDelete = () => {
    deleteOrders(deleteModal.orderIds, {
      onSuccess: () => {
        setDeleteModal({ isOpen: false, orderIds: [], orderNumber: '' });
        console.log('Commande supprimée avec succès');
      },
      onError: (error) => {
        console.error('Erreur lors de la suppression de la commande:', error);
        setDeleteModal({ isOpen: false, orderIds: [], orderNumber: '' });
      },
    });
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, orderIds: [], orderNumber: '' });
    }
  };

  const filterOptions = useMemo(() => [
    {
      key: 'status',
      label: 'Statut',
      options: Object.entries(statusLabels).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: 'paymentStatus',
      label: 'Statut paiement',
      options: Object.entries(paymentStatusLabels).map(([value, label]) => ({
        value,
        label,
      })),
    },
  ], []);

  const ordersConfig: ManagementPageConfig<Order> = useMemo(() => ({
    title: 'Gestion des commandes',
    useDataHook: () => ({
      data: orders,
      isLoading,
      isFetching,
      error: error ?? undefined,
      refetch,
    }),
    columns: [
      {
        accessorKey: 'orderNumber',
        header: 'N° Commande',
        cell: ({ getValue }) => (
          <span className="font-semibold text-blue-600">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'client',
        header: 'Client',
        cell: ({ row }) => {
          const client = row.original.client;
          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {client?.firstName} {client?.lastName}
              </span>
              <span className="text-sm text-gray-500">{client?.email}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ getValue }) => {
          const status = getValue() as OrderStatus;
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
              {statusLabels[status]}
            </span>
          );
        },
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Paiement',
        cell: ({ getValue }) => {
          const paymentStatus = getValue() as PaymentStatus;
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[paymentStatus]}`}>
              {paymentStatusLabels[paymentStatus]}
            </span>
          );
        },
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total',
        cell: ({ getValue }) => (
          <span className="text-green-600 font-bold flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {(getValue() as number).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: '_count.items',
        header: 'Articles',
        cell: ({ row }) => {
          const count = row.original._count?.items || row.original.items?.length || 0;
          return (
            <span className="flex items-center gap-1 text-gray-600">
              <Package className="w-4 h-4" />
              {count}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ getValue }) => {
          const date = getValue() as Date | string;
          return (
            <span className="text-sm text-gray-500">
              {new Date(date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
          );
        },
      },
    ] as ColumnDef<Order>[],
    addNewButton: {
      label: 'Nouvelle commande',
      onClick: () => router.push('/dashboard/orders/add'),
    },
    actions: [
      {
        label: 'View',
        variant: 'primary',
        icon: <Eye className="w-4 h-4" />,
        onClick: (id) => router.push(`/dashboard/orders/${id}/view`),
      },
      {
        label: 'Edit',
        variant: 'secondary',
        icon: <Pencil className="w-4 h-4" />,
        onClick: (id) => router.push(`/dashboard/orders/${id}/edit`),
      },
      {
        label: 'Delete',
        variant: 'danger',
        icon: <Trash2 className="w-4 h-4" />,
        onClick: (id) => handleDeleteClick(id),
      },
    ],
    filters: filterOptions,
  }), [orders, isLoading, isFetching, error, refetch, router, filterOptions, handleDeleteClick]);

  return (
    <DashboardLayout>
      <ManagementPage config={ordersConfig} />
      
      <ActionModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={deleteModal.orderNumber}
        itemCount={deleteModal.orderIds.length}
        isProcessing={isDeleting}
        actionType="delete"
      />
    </DashboardLayout>
  );
}