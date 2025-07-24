'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Category } from '@/types/category.type'
import { categorySchema, CategoryFormData } from '@/schemas/category.schema'
import { useTheme } from '@/context/ThemeContext'
import FormField from '../ui/formfield'
import Input from '../ui/input'
import Button from '../ui/button'

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {}
  });

  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name);
      setValue('description', initialData.description);
    }
  }, [initialData, setValue]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data);
   
    if (!initialData) {
      reset();
    }
  };

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