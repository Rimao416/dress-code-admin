'use client';
import { ManagementPageConfig } from "@/types/management.type";
import { SubCategory } from "@/types/subCategory.type";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import ManagementPage from "@/components/common/ManagementPage";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useSubCategories } from "@/hooks/subCategories/useSubCategories";
import ActionModal from "@/components/common/ActionModal";
import { useDeleteSubCategory } from "@/hooks/subCategories/useDeleteCategory";

export default function SubCategoriesPage() {
  const router = useRouter();
  const { data: subCategories, isLoading, isFetching, error, refetch } = useSubCategories();
  const { mutate: deleteSubCategories, isPending: isDeleting } = useDeleteSubCategory();
  
  // État pour le modal de suppression
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    subCategoryIds: string[];
    subCategoryName: string;
  }>({
    isOpen: false,
    subCategoryIds: [],
    subCategoryName: ''
  });

  // Ouvrir le modal de suppression
  const handleDeleteClick = useCallback((id: string) => {
    const subCategory = subCategories?.find(sc => sc.id === id);
    const subCategoryName = subCategory?.name || 'sous-catégorie';
   
    setDeleteModal({
      isOpen: true,
      subCategoryIds: [id],
      subCategoryName: subCategoryName
    });
  }, [subCategories]);

  // Confirmer suppression
  const handleConfirmDelete = () => {
    deleteSubCategories(deleteModal.subCategoryIds, {
      onSuccess: () => {
        setDeleteModal({ isOpen: false, subCategoryIds: [], subCategoryName: '' });
        console.log('Sous-catégorie supprimée avec succès');
      },
      onError: (error) => {
        console.error('Erreur lors de la suppression de la sous-catégorie:', error);
        setDeleteModal({ isOpen: false, subCategoryIds: [], subCategoryName: '' });
      },
    });
  };

  // Fermer le modal
  const handleCloseModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, subCategoryIds: [], subCategoryName: '' });
    }
  };

  // Filtres
  const filterOptions = useMemo(() => [
    // {
    //   key: 'createdAt',
    //   label: 'Date',
    //   options: [],
    // },
  ], []);

  // Config de la page de gestion
  const subCategoriesConfig: ManagementPageConfig<SubCategory> = useMemo(() => ({
    title: 'Gestion des sous-catégories',
    useDataHook: () => ({
      data: subCategories,
      isLoading,
      isFetching,
      error: error ?? undefined,
      refetch,
    }),
    columns: [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ getValue }) => (
          <span className="text-gray-500">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Nom de la sous-catégorie',
      },
      {
        accessorKey: 'category.name',
        header: 'Catégorie parente',
        cell: ({ row }) => (
          <span className="text-gray-500">{row.original.category?.name || 'N/A'}</span>
        ),
      },
      // {
      //   accessorKey: 'createdAt',
      //   header: 'Date de création',
      //   cell: ({ getValue }) => {
      //     const value = getValue() as string;
      //     const date = format(new Date(value), 'dd/MM/yyyy');
      //     return <span className="text-gray-500">{date}</span>;
      //   },
      // },
    ] as ColumnDef<SubCategory>[],
    addNewButton: {
      label: 'Ajouter une sous-catégorie',
      onClick: () => router.push('/dashboard/sub-categories/add'),
    },
    actions: [
      {
        label: 'Edit',
        variant: 'secondary',
        onClick: (id) => router.push(`/dashboard/sub-categories/${id}/edit`),
      },
      {
        label: 'Delete',
        variant: 'danger',
        onClick: (id) => handleDeleteClick(id),
      },
    ],
    filters: filterOptions,
  }), [subCategories, isLoading, isFetching, error, refetch, router, filterOptions, handleDeleteClick]);

  return (
    <DashboardLayout>
      <ManagementPage config={subCategoriesConfig} />
      
      {/* Modal de confirmation de suppression */}
      <ActionModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={deleteModal.subCategoryName}
        itemCount={deleteModal.subCategoryIds.length}
        isProcessing={isDeleting}
        actionType="delete"
      />
    </DashboardLayout>
  );
}