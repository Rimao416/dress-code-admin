'use client';
import { ManagementPageConfig } from "@/types/management.type";
import { Brand } from "@/types/brand.type";
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import ManagementPage from "@/components/common/ManagementPage";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useBrands } from "@/hooks/brands/useBrands";
import ActionModal from "@/components/common/ActionModal";
import { useDeleteBrand } from "@/hooks/brands/useDeleteBrand";
import { useBrandStore } from "@/store/brandStore";

export default function BrandsPage() {
  const router = useRouter();
  const { data: brands, isLoading, isFetching, error, refetch } = useBrands();
  console.log(brands);
  const { mutate: deleteBrands, isPending: isDeleting } = useDeleteBrand();

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    brandIds: string[];
    brandName: string;
  }>({
    isOpen: false,
    brandIds: [],
    brandName: '',
  });

  const handleDeleteClick = useCallback((id: string) => {
    const brand = brands?.find(b => b.id === id);
    const brandName = brand?.name || 'marque';

    setDeleteModal({
      isOpen: true,
      brandIds: [id],
      brandName: brandName,
    });
  }, [brands]);

  const handleConfirmDelete = () => {
    deleteBrands(deleteModal.brandIds, {
      onSuccess: () => {
        setDeleteModal({ isOpen: false, brandIds: [], brandName: '' });
        console.log('Marque supprimée avec succès');
      },
      onError: (error) => {
        console.error('Erreur lors de la suppression de la marque:', error);
        setDeleteModal({ isOpen: false, brandIds: [], brandName: '' });
      },
    });
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, brandIds: [], brandName: '' });
    }
  };

  const filterOptions = useMemo(() => [
    {
      key: 'isActive',
      label: 'Statut',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ], []);

  const brandsConfig: ManagementPageConfig<Brand> = useMemo(() => ({
    title: 'Gestion des marques',
    useDataHook: () => ({
      data: brands,
      isLoading,
      isFetching,
      error: error ?? undefined,
      refetch,
    }),
    columns: [
      {
        accessorKey: 'name',
        header: 'Nom de la marque',
        cell: ({ getValue }) => (
          <span className="font-semibold">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => {
          const description = getValue() as string | null;
          return (
            <span className="text-gray-500 text-sm">
              {description ? (description.length > 50 ? `${description.substring(0, 50)}...` : description) : '-'}
            </span>
          );
        },
      },
      {
        accessorKey: 'website',
        header: 'Site web',
        cell: ({ getValue }) => {
          const website = getValue() as string | null;
          return website ? (
            <a 
              href={website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Visiter
            </a>
          ) : (
            <span className="text-gray-400">-</span>
          );
        },
      },
      {
        accessorKey: '_count.products',
        header: 'Produits',
        cell: ({ row }) => {
          const count = row.original._count?.products || 0;
          return (
            <span className={`font-medium ${count > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              {count}
            </span>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Statut',
        cell: ({ getValue }) => {
          const isActive = getValue() as boolean;
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
    ] as ColumnDef<Brand>[],
    addNewButton: {
      label: 'Ajouter une marque',
      onClick: () => router.push('/dashboard/brands/add'),
    },
    actions: [
      {
        label: 'View',
        variant: 'primary',
        icon: <Eye className="w-4 h-4" />,
        onClick: (id) => router.push(`/dashboard/brands/${id}/view`),
      },
      {
        label: 'Edit',
        variant: 'secondary',
        icon: <Pencil className="w-4 h-4" />,
        onClick: (id) => router.push(`/dashboard/brands/${id}/edit`),
      },
      {
        label: 'Delete',
        variant: 'danger',
        icon: <Trash2 className="w-4 h-4" />,
        onClick: (id) => handleDeleteClick(id),
      },
    ],
    filters: filterOptions,
  }), [brands, isLoading, isFetching, error, refetch, router, filterOptions, handleDeleteClick]);

  return (
    <DashboardLayout>
      <ManagementPage config={brandsConfig} />
      
      <ActionModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={deleteModal.brandName}
        itemCount={deleteModal.brandIds.length}
        isProcessing={isDeleting}
        actionType="delete"
      />
    </DashboardLayout>
  );
}