'use client'
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Category } from '@/types/category.type'
import { categorySchema, CategoryFormData } from '@/schemas/category.schema'
import { useTheme } from '@/context/ThemeContext'
import FormField from '../ui/formfield'
import Input from '../ui/input'
import Button from '../ui/button'
import Select from '../ui/select'
import { useCategoryStore } from '@/store/categoryStore'

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => Promise<void>;
  initialData?: Category;
  isSubmitting: boolean;
  submitButtonText: string;
}

export default function CategoryForm({
  onSubmit,
  initialData,
  isSubmitting,
  submitButtonText,
}: CategoryFormProps) {
  const { isDarkMode } = useTheme();
  const { categories, getRootCategories, getCategoriesHierarchy } = useCategoryStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control // Ajout du control pour Controller
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {}
  });

  const watchParentId = watch('parentId');

  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name);
      setValue('description', initialData.description || '');
      setValue('parentId', initialData.parentId || '');
      setValue('image', initialData.image || '');
      setValue('isActive', initialData.isActive ?? true);
      setValue('sortOrder', initialData.sortOrder || 0);
    }
  }, [initialData, setValue]);

  const handleFormSubmit = async (data: CategoryFormData) => {
  // Nettoyer les données avant soumission
  const cleanData: CategoryFormData = {
    name: data.name,
    description: data.description === '' ? undefined : data.description,
    parentId: data.parentId === '' ? undefined : data.parentId, // undefined au lieu de null
    image: data.image === '' ? undefined : data.image,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
  };
  
  await onSubmit(cleanData);
 
  if (!initialData) {
    reset();
  }
};

  // Obtenir les catégories disponibles comme parents (exclure la catégorie actuelle et ses enfants)
  const getAvailableParentCategories = () => {
    if (!initialData) {
      return getCategoriesHierarchy();
    }

    // Exclure la catégorie actuelle et ses descendants
    const excludeIds = new Set([initialData.id]);
    
    const addDescendants = (categoryId: string) => {
      categories.forEach(cat => {
        if (cat.parentId === categoryId) {
          excludeIds.add(cat.id);
          addDescendants(cat.id);
        }
      });
    };
    
    addDescendants(initialData.id);
    
    return getCategoriesHierarchy().filter(cat => !excludeIds.has(cat.id));
  };

  const availableParents = getAvailableParentCategories();

  // Créer les options pour le select avec indentation
  const parentOptions = [
    { value: '', label: 'Aucune catégorie parente (Catégorie racine)' },
    ...availableParents.map(category => ({
      value: category.id,
      label: '  '.repeat(category.level) + category.name
    }))
  ];

  return (
    <div className={`p-6 rounded-xl transition-all duration-300 ${
      isDarkMode
        ? 'bg-slate-800/50 border-slate-700'
        : 'bg-white/70 border-slate-200'
    } border backdrop-blur-sm shadow-lg`}>
     
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
       
        {/* Nom de la catégorie - REQUIS */}
        <FormField
          label="Nom de la catégorie"
          htmlFor="name"
          error={errors.name?.message}
          required={true}
        >
          <Input
            id="name"
            placeholder="Entrez le nom de la catégorie"
            {...register('name')}
          />
        </FormField>

        {/* Description de la catégorie - OPTIONNEL */}
        <FormField
          label="Description de la catégorie"
          htmlFor="description"
          error={errors.description?.message}
          required={false}
          helpText="Champ optionnel pour ajouter des détails supplémentaires"
        >
          <Input
            id="description"
            placeholder="Entrez une description (facultatif)"
            {...register('description')}
          />
        </FormField>

        {/* Catégorie parente - UTILISATION DE CONTROLLER */}
        <FormField
          label="Catégorie parente"
          htmlFor="parentId"
          error={errors.parentId?.message}
          required={false}
          helpText="Sélectionnez une catégorie parente pour créer une sous-catégorie"
        >
          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <Select
                id="parentId"
                options={parentOptions}
                value={field.value || ''}
                onValueChange={field.onChange}
                placeholder="Sélectionnez une catégorie parente"
              />
            )}
          />
        </FormField>

        {/* Image URL - OPTIONNEL */}
        <FormField
          label="URL de l'image"
          htmlFor="image"
          error={errors.image?.message}
          required={false}
          helpText="URL de l'image représentant la catégorie"
        >
          <Input
            id="image"
            placeholder="https://exemple.com/image.jpg"
            {...register('image')}
          />
        </FormField>

        {/* Ordre de tri */}
        <FormField
          label="Ordre de tri"
          htmlFor="sortOrder"
          error={errors.sortOrder?.message}
          required={false}
          helpText="Nombre pour définir l'ordre d'affichage (0 = premier)"
        >
          <Input
            id="sortOrder"
            type="number"
            placeholder="0"
            {...register('sortOrder', { valueAsNumber: true })}
          />
        </FormField>

        {/* Statut actif */}
        <FormField
          label="Statut"
          htmlFor="isActive"
          error={errors.isActive?.message}
          required={false}
        >
          <div className="flex items-center space-x-2">
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Catégorie active
            </label>
          </div>
        </FormField>

        {/* Bouton de soumission */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {submitButtonText}
          </Button>
        </div>
      </form>
    </div>
  )
}