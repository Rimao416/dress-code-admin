'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '../ui/input'
import Button from '../ui/button'
import { SubCategory } from '@/types/subCategory.type'
import Select from '../ui/select'
import FormField from '../ui/formfield'
import { useCategoryStore } from '@/store/categoryStore'
import { useCategories } from '@/hooks/categories/useCategories'
import { subCategorySchema, SubCategoryFormData } from '@/schemas/subCategory.schema'
import { useTheme } from '@/context/ThemeContext'

interface SubCategoryFormProps {
  onSubmit: (data: SubCategoryFormData) => Promise<void>;
  initialData?: SubCategory;
  isSubmitting: boolean;
  submitButtonText: string;
}

export default function SubCategoryForm({
  onSubmit,
  initialData,
  isSubmitting,
  submitButtonText,
}: SubCategoryFormProps) {
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()
  const { selectedCategory } = useCategoryStore()
  const { isDarkMode } = useTheme()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<SubCategoryFormData>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {}
  });

  // Préparation des options pour le Select
  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  const selectedCategoryId = watch('categoryId');

  useEffect(() => {
    if (selectedCategory && !initialData) {
      setValue("categoryId", selectedCategory.id);
    }
  }, [selectedCategory, setValue, initialData]);

  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name)
      setValue("categoryId", initialData.category.id);
    }
  }, [initialData, setValue]);

  const handleFormSubmit = async (data: SubCategoryFormData) => {
    await onSubmit(data);
    if (!initialData) {
      reset();
      if (selectedCategory) {
        setValue("categoryId", selectedCategory.id);
      }
    }
  };

  const handleCategoryChange = (value: string) => {
    setValue('categoryId', value);
  };

  return (
    <div className={`p-6 rounded-xl transition-all duration-300 ${
      isDarkMode
        ? 'bg-slate-800/50 border-slate-700'
        : 'bg-white/70 border-slate-200'
    } border backdrop-blur-sm shadow-lg`}>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        
        {/* Nom de la sous-catégorie - REQUIS */}
        <FormField
          label="Nom de la sous-catégorie"
          htmlFor="name"
          error={errors.name?.message}
          required={true}
        >
          <Input
            id="name"
            placeholder="Entrez le nom de la sous-catégorie"
            error={errors.name?.message}
            {...register('name')}
          />
        </FormField>

        {/* Sélection de la catégorie parente - REQUIS */}
        <FormField
          label="Catégorie parente"
          htmlFor="categoryId"
          error={errors.categoryId?.message}
          required={true}
          helpText={
            initialData 
              ? "Vous pouvez modifier la catégorie parente si nécessaire"
              : selectedCategory 
                ? `Pré-sélectionnée : ${selectedCategory.name}`
                : "Sélectionnez la catégorie parente pour cette sous-catégorie"
          }
        >
          <Select
            options={categoryOptions}
            value={selectedCategoryId}
            onValueChange={handleCategoryChange}
            placeholder={
              isCategoriesLoading 
                ? "Chargement des catégories..." 
                : "Sélectionnez une catégorie parente"
            }
            error={errors.categoryId?.message}
            disabled={isCategoriesLoading}
            required
          />
        </FormField>

        {/* Informations contextuelles */}
        {initialData && (
          <div className={`p-4 rounded-lg border-l-4 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-500/50 text-blue-200' 
              : 'bg-blue-50 border-blue-400 text-blue-700'
          }`}>
            <p className="text-sm">
              <span className="font-medium">Modification :</span> "{initialData.name}" 
              <span className="opacity-75"> (actuellement dans "{initialData.category.name}")</span>
            </p>
          </div>
        )}

        {/* Bouton de soumission */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting || isCategoriesLoading}
          >
            {submitButtonText}
          </Button>
        </div>
      </form>
    </div>
  )
}