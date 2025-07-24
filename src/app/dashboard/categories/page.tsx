"use client";
import { ManagementPageConfig } from "@/types/management.type";
import { Category } from "@/types/category.type";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import ManagementPage from "@/components/common/ManagementPage";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useCategories } from "@/hooks/categories/useCategories";
import { useDeleteCategory } from "@/hooks/categories/useDeleteCategory";
import ActionModal from "@/components/common/ActionModal";

export default function CategoriesPage() {
  const router = useRouter();
  const { data: categories, isLoading, isFetching, error, refetch } = useCategories();

  const { mutate: deleteCategories, isPending: isDeleting } = useDeleteCategory();
  
  console.log(categories);

  // État pour le modal de suppression
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    categoryIds: string[];
    categoryName: string;
  }>({
    isOpen: false,
    categoryIds: [],
    categoryName: ''
  });

  // Ouvrir le modal de suppression
  const handleDeleteClick = useCallback((id: string) => {
    const category = categories?.find(c => c.id === id);
    const categoryName = category?.name || 'catégorie';
   
    setDeleteModal({
      isOpen: true,
      categoryIds: [id],
      categoryName: categoryName
    });
  }, [categories]);

  // Confirmer suppression
  const handleConfirmDelete = () => {
    deleteCategories(deleteModal.categoryIds, {
      onSuccess: () => {
        setDeleteModal({ isOpen: false, categoryIds: [], categoryName: '' });
        console.log('Catégorie supprimée avec succès');
      },
      onError: (error) => {
        console.error('Erreur lors de la suppression de la catégorie:', error);
        setDeleteModal({ isOpen: false, categoryIds: [], categoryName: '' });
      },
    });
  };

  // Fermer le modal
  const handleCloseModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, categoryIds: [], categoryName: '' });
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
  const categoriesConfig: ManagementPageConfig<Category> = useMemo(() => ({
    title: 'Gestion des catégories',
    useDataHook: () => ({
      data: categories,
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
        header: 'Nom de la catégorie',
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => (
          <span className="text-gray-500">{getValue() as string}</span>
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
    ] as ColumnDef<Category>[],
    addNewButton: {
      label: 'Ajouter une catégorie',
      onClick: () => router.push('/dashboard/categories/add'),
    },
    actions: [
      {
        label: 'Edit',
        variant: 'secondary',
        onClick: (id) => router.push(`/dashboard/categories/${id}/edit`),
      },
      {
        label: 'Delete',
        variant: 'danger',
        onClick: (id) => handleDeleteClick(id),
      },
    ],
    filters: filterOptions,
  }), [categories, isLoading, isFetching, error, refetch, router, filterOptions, handleDeleteClick]);

  return (
    <DashboardLayout>
      <ManagementPage config={categoriesConfig} />
      
      {/* Modal de confirmation de suppression */}
      <ActionModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={deleteModal.categoryName}
        itemCount={deleteModal.categoryIds.length}
        isProcessing={isDeleting}
        actionType="delete"
      />
    </DashboardLayout>
  );
}