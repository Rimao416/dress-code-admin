'use client';
import { ManagementPageConfig } from "@/types/management.type";
import { Category } from "@/types/category.type";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import ManagementPage from "@/components/common/ManagementPage";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useCategories } from "@/hooks/categories/useCategories";
import ActionModal from "@/components/common/ActionModal";
import { useDeleteCategory } from "@/hooks/categories/useDeleteCategory";
import {useCategoryStore} from "@/store/categoryStore";
export default function CategoriesPage() {
  const router = useRouter();
  const { data: categories, isLoading, isFetching, error, refetch } = useCategories();
  const { mutate: deleteCategories, isPending: isDeleting } = useDeleteCategory();
  const { getCategoriesHierarchy } = useCategoryStore();
  
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

  // Transformer les données en hiérarchie pour l'affichage
  const hierarchicalCategories = useMemo(() => {
    if (!categories) return [];
    return getCategoriesHierarchy();
  }, [categories, getCategoriesHierarchy]);

  // Filtres
  const filterOptions = useMemo(() => [
    {
      key: 'isActive',
      label: 'Statut',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ],
    },
    {
      key: 'parentId',
      label: 'Type',
      options: [
        { value: 'null', label: 'Catégorie racine' },
        { value: 'not-null', label: 'Sous-catégorie' }
      ],
    },
  ], []);

  // Config de la page de gestion
  const categoriesConfig: ManagementPageConfig<Category> = useMemo(() => ({
    title: 'Gestion des catégories',
    useDataHook: () => ({
      data: hierarchicalCategories,
      isLoading,
      isFetching,
      error: error ?? undefined,
      refetch,
    }),
    columns: [
      {
        accessorKey: 'name',
        header: 'Nom de la catégorie',
        cell: ({ row }) => {
          const category = row.original as any;
          const indent = '  '.repeat(category.level || 0);
          return (
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">{indent}</span>
              {category.level > 0 && <span className="text-gray-400 mr-2">└─</span>}
              <span className={category.level > 0 ? 'text-blue-600' : 'font-semibold'}>
                {category.name}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return (
            <span className="text-gray-500 truncate max-w-xs">
              {value || 'Aucune description'}
            </span>
          );
        },
      },
      {
        accessorKey: 'parent.name',
        header: 'Catégorie parente',
        cell: ({ row }) => (
          <span className="text-gray-500">
            {row.original.parent?.name || 'Catégorie racine'}
          </span>
        ),
      },
      {
        accessorKey: '_count.children',
        header: 'Sous-catégories',
        cell: ({ row }) => {
          const count = row.original._count?.children || 0;
          return (
            <span className="text-gray-500">
              {count}
            </span>
          );
        },
      },
      {
        accessorKey: '_count.products',
        header: 'Produits',
        cell: ({ row }) => {
          const count = row.original._count?.products || 0;
          return (
            <span className="text-gray-500">
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
      {
        accessorKey: 'sortOrder',
        header: 'Ordre',
        cell: ({ getValue }) => (
          <span className="text-gray-500">{getValue() as number}</span>
        ),
      },
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
  }), [hierarchicalCategories, isLoading, isFetching, error, refetch, router, filterOptions, handleDeleteClick]);

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