'use client';
import { ManagementPageConfig } from "@/types/management.type";
import { Product } from "@/types/product.type";
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import ManagementPage from "@/components/common/ManagementPage";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useProducts } from "@/hooks/products/useProducts";
import ActionModal from "@/components/common/ActionModal";
import { useDeleteProduct } from "@/hooks/products/useDeleteProduct";
import { useProductStore } from "@/store/productStore";

export default function ProductsPage() {
  const router = useRouter();
  const { data: products, isLoading, isFetching, error, refetch } = useProducts();
  console.log(products)
  const { mutate: deleteProducts, isPending: isDeleting } = useDeleteProduct();

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productIds: string[];
    productName: string;
  }>({
    isOpen: false,
    productIds: [],
    productName: '',
  });

  const handleDeleteClick = useCallback((id: string) => {
    const product = products?.find(p => p.id === id);
    const productName = product?.name || 'produit';

    setDeleteModal({
      isOpen: true,
      productIds: [id],
      productName: productName,
    });
  }, [products]);

  const handleConfirmDelete = () => {
    deleteProducts(deleteModal.productIds, {
      onSuccess: () => {
        setDeleteModal({ isOpen: false, productIds: [], productName: '' });
        console.log('Produit supprimé avec succès');
      },
      onError: (error) => {
        console.error('Erreur lors de la suppression du produit:', error);
        setDeleteModal({ isOpen: false, productIds: [], productName: '' });
      },
    });
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, productIds: [], productName: '' });
    }
  };

  const filterOptions = useMemo(() => [
    {
      key: 'available',
      label: 'Disponibilité',
      options: [
        { value: 'true', label: 'Disponible' },
        { value: 'false', label: 'Indisponible' },
      ],
    },
    {
      key: 'featured',
      label: 'Mise en avant',
      options: [
        { value: 'true', label: 'En vedette' },
        { value: 'false', label: 'Normal' },
      ],
    },
  ], []);

  const productsConfig: ManagementPageConfig<Product> = useMemo(() => ({
    title: 'Gestion des produits',
    useDataHook: () => ({
      data: products,
      isLoading,
      isFetching,
      error: error ?? undefined,
      refetch,
    }),
    columns: [
      {
        accessorKey: 'name',
        header: 'Nom du produit',
        cell: ({ getValue }) => (
          <span className="font-semibold">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ getValue }) => (
          <span className="text-gray-500 text-sm">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'category.name',
        header: 'Catégorie',
        cell: ({ row }) => (
          <span className="text-gray-500">
            {row.original.category?.name || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Prix',
        cell: ({ getValue }) => (
          <span className="text-blue-600 font-medium">
            ${(getValue() as number).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ getValue }) => {
          const stock = getValue() as number;
          return (
            <span className={stock > 0 ? 'text-green-600' : 'text-red-600'}>
              {stock}
            </span>
          );
        },
      },
      {
        accessorKey: 'available',
        header: 'Disponibilité',
        cell: ({ getValue }) => {
          const available = getValue() as boolean;
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              available
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {available ? 'Disponible' : 'Indisponible'}
            </span>
          );
        },
      },
      {
        accessorKey: 'featured',
        header: 'En vedette',
        cell: ({ getValue }) => {
          const featured = getValue() as boolean;
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              featured
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {featured ? 'Oui' : 'Non'}
            </span>
          );
        },
      },
    ] as ColumnDef<Product>[],
    addNewButton: {
      label: 'Ajouter un produit',
      onClick: () => router.push('/dashboard/products/add'),
    },
actions: [
  {
    label: 'View',  // ← était 'Voir'
    variant: 'primary',
    icon: <Eye className="w-4 h-4" />,
    onClick: (id) => router.push(`/dashboard/products/${id}/view`),
  },
  {
    label: 'Edit',  // ← était 'Modifier'
    variant: 'secondary',
    icon: <Pencil className="w-4 h-4" />,
    onClick: (id) => router.push(`/dashboard/products/${id}/edit`),
  },
  {
    label: 'Delete',  // ← était 'Supprimer'
    variant: 'danger',
    icon: <Trash2 className="w-4 h-4" />,
    onClick: (id) => handleDeleteClick(id),
  },
],
    filters: filterOptions,
  }), [products, isLoading, isFetching, error, refetch, router, filterOptions, handleDeleteClick]);

  return (
    <DashboardLayout>
      <ManagementPage config={productsConfig} />
      
      <ActionModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={deleteModal.productName}
        itemCount={deleteModal.productIds.length}
        isProcessing={isDeleting}
        actionType="delete"
      />
    </DashboardLayout>
  );
}