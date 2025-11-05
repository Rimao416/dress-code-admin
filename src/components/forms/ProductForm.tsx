// components/forms/ProductForm.tsx (version corrigée)
'use client'
import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Product } from '@/types/product.type'
import { Category } from '@/types/category.type'
import { useBrands } from '@/hooks/brands/useBrands'
import { useTheme } from '@/context/ThemeContext'
import { ChevronLeft, ChevronRight, Upload, X, Plus, Check, Loader2 } from 'lucide-react'
import FormField from '../ui/formfield'
import Input from '../ui/input'
import Select from '../ui/select'
import Button from '../ui/button'
import { productSchema, ProductFormData } from '@/schemas/productSchema'
import { CloudinaryService } from '@/services/cloudinary.service'
import Image from 'next/image'


interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: Product;
  isSubmitting: boolean;
  submitButtonText: string;
  categories: Category[]; // ✅ Utiliser le type Category complet
}

const STEPS = [
  { id: 1, title: 'Informations générales', description: 'Détails de base du produit' },
  { id: 2, title: 'Catégorisation', description: 'Classification du produit' },
  { id: 3, title: 'Déclinaisons', description: 'Variantes disponibles' },
  { id: 4, title: 'Options avancées', description: 'SEO et paramètres' }, // ✅ MODIFIER
  { id: 5, title: 'Résumé', description: 'Vérification finale' } // ✅ AJOUTER
];

const COLORS = [
  { name: 'Rouge', value: 'red', hex: '#ef4444' },
  { name: 'Bleu', value: 'blue', hex: '#3b82f6' },
  { name: 'Vert', value: 'green', hex: '#10b981' },
  { name: 'Jaune', value: 'yellow', hex: '#f59e0b' },
  { name: 'Violet', value: 'purple', hex: '#8b5cf6' },
  { name: 'Rose', value: 'pink', hex: '#ec4899' },
  { name: 'Noir', value: 'black', hex: '#000000' },
  { name: 'Blanc', value: 'white', hex: '#ffffff' },
  { name: 'Gris', value: 'gray', hex: '#6b7280' },
  { name: 'Orange', value: 'orange', hex: '#f97316' }
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface ImageUploadState {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  cloudinaryUrl?: string;
  progress: number;
}

export default function ProductForm({
  onSubmit,
  initialData,
  isSubmitting,
  submitButtonText,
  categories
}: ProductFormProps) {
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [imageStates, setImageStates] = useState<ImageUploadState[]>([]);
  const [variants, setVariants] = useState([{ size: '', color: '', quantity: 0 }]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const { data: brands = [] } = useBrands({ isActive: true })
    const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
  variants: [{ size: '', color: '', quantity: 0 }],
  available: true,
  stock: 0,
  // ✅ AJOUTER ICI
  featured: false,
  isNewIn: false,
  tags: [],
  shortDescription: '',
  comparePrice: null,
  metaTitle: null,
  metaDescription: null,
  weight: null,
  dimensions: null,
}
  });

  const watchedCategoryId = watch('categoryId');
  const watchedBrandId = watch('brandId')
  const watchedSubcategoryId = watch('subcategoryId');
  const watchedValues = watch();

  // ✅ Filtrer les catégories parentes (sans parentId)
  const parentCategories = categories.filter(cat => !cat.parentId);
  
  // ✅ Filtrer les sous-catégories en fonction de la catégorie sélectionnée
  const subcategories = watchedCategoryId 
    ? categories.filter(cat => cat.parentId === watchedCategoryId)
    : [];

  useEffect(() => {
    if (!initialData) return;

    setValue('name', initialData.name);
    setValue('description', initialData.description);
    setValue('price', initialData.price);
    setValue('categoryId', initialData.categoryId);
    setValue('stock', typeof initialData.stock === 'number' ? initialData.stock : 0);
    setValue('available', typeof initialData.available === 'boolean' ? initialData.available : true);
   setValue('brandId', initialData.brandId ?? undefined);
   setValue('shortDescription', initialData.shortDescription || '');
setValue('comparePrice', initialData.comparePrice ?? null);
setValue('featured', initialData.featured ?? false);
setValue('isNewIn', initialData.isNewIn ?? false);
setValue('tags', initialData.tags || []);
setValue('metaTitle', initialData.metaTitle || null);
setValue('metaDescription', initialData.metaDescription || null);
setValue('weight', initialData.weight ?? null);
setValue('dimensions', initialData.dimensions ?? null);
   
    if (Array.isArray(initialData.variants) && initialData.variants.length > 0) {
      const mappedVariants = initialData.variants
        .filter(v => v.size && v.color)
        .map(v => ({
          size: v.size as string,
          color: v.color as string,
          quantity: v.stock || 0
        }));
      
      if (mappedVariants.length > 0) {
        setVariants(mappedVariants);
        setValue('variants', mappedVariants);
      }
    }
    
    if (Array.isArray(initialData.images) && initialData.images.length > 0) {
      const existingImages: ImageUploadState[] = initialData.images.map(url => ({
        file: new File([], 'existing'),
        preview: url,
        uploading: false,
        uploaded: true,
        cloudinaryUrl: url,
        progress: 100
      }));
      setImageStates(existingImages);
    }
  }, [initialData, setValue]);

  // ✅ Réinitialiser subcategoryId quand on change de catégorie
  useEffect(() => {
    if (watchedCategoryId) {
      setValue('subcategoryId', undefined);
    }
  }, [watchedCategoryId, setValue]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const newImageStates: ImageUploadState[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false,
      progress: 0
    }));
    
    setImageStates(prev => [...prev, ...newImageStates]);
  };

  const uploadAllImages = async (): Promise<string[]> => {
    const imagesToUpload = imageStates.filter(state => !state.uploaded && !state.error);
    
    if (imagesToUpload.length === 0) {
      return imageStates
        .filter(state => state.uploaded && state.cloudinaryUrl)
        .map(state => state.cloudinaryUrl!);
    }

    setIsUploadingImages(true);
    
    const uploadPromises = imagesToUpload.map(async (imageState) => {
      const actualIndex = imageStates.findIndex(state => state === imageState);
      
      setImageStates(prev => prev.map((state, i) =>
        i === actualIndex ? { ...state, uploading: true } : state
      ));

      try {
        const result = await CloudinaryService.uploadImageWithProgress(
          imageState.file,
          (progress) => {
            setImageStates(prev => prev.map((state, i) =>
              i === actualIndex ? { ...state, progress } : state
            ));
          }
        );

        setImageStates(prev => prev.map((state, i) =>
          i === actualIndex ? {
            ...state,
            uploading: false,
            uploaded: true,
            cloudinaryUrl: result.secure_url,
            progress: 100
          } : state
        ));

        return result.secure_url;
      } catch (error) {
        setImageStates(prev => prev.map((state, i) =>
          i === actualIndex ? {
            ...state,
            uploading: false,
            error: error instanceof Error ? error.message : 'Upload failed'
          } : state
        ));
        throw error;
      }
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      setIsUploadingImages(false);
      
      const existingUrls = imageStates
        .filter(state => state.uploaded && state.cloudinaryUrl && !imagesToUpload.includes(state))
        .map(state => state.cloudinaryUrl!);
      
      return [...existingUrls, ...uploadedUrls];
    } catch (error) {
      setIsUploadingImages(false);
      throw error;
    }
  };

  const removeImage = async (index: number) => {
    const imageState = imageStates[index];
   
    if (imageState.uploaded && imageState.cloudinaryUrl) {
      const publicId = imageState.cloudinaryUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        await CloudinaryService.deleteImage(publicId);
      }
    }

    if (imageState.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageState.preview);
    }

    setImageStates(prev => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    const newVariants = [...variants, { size: '', color: '', quantity: 0 }];
    setVariants(newVariants);
    setValue('variants', newVariants);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
      setValue('variants', newVariants);
    }
  };

  interface ProductVariant {
    size: string;
    color: string;
    quantity: number;
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
    setValue('variants', newVariants);
  };

  const handleFormSubmit: SubmitHandler<ProductFormData> = async (data: ProductFormData) => {
    try {
      const uploadedImageUrls = await uploadAllImages();
     
      if (uploadedImageUrls.length === 0) {
        alert('Veuillez ajouter au moins une image');
        return;
      }

      const formDataWithImages = {
        ...data,
        imageUrls: uploadedImageUrls
      };

      await onSubmit(formDataWithImages);
     
      if (!initialData) {
        reset();
        setCurrentStep(1);
        setImageStates([]);
        setVariants([{ size: '', color: '', quantity: 0 }]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload des images:', error);
      alert('Erreur lors de l\'upload des images. Veuillez réessayer.');
    }
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      const hasImages = imageStates.length > 0;
      return hasImages && !isUploadingImages;
    }
    return true;
  };

const nextStep = async () => {
  let fieldsToValidate: (keyof ProductFormData)[] = [];
 
  switch (currentStep) {
    case 1:
      fieldsToValidate = ['name', 'description', 'price'];
      break;
    case 2:
      fieldsToValidate = ['categoryId'];
      break;
    case 3:
      fieldsToValidate = ['variants'];
      break;
    // Pas de validation obligatoire pour l'étape 4
  }
 
  const isValid = await trigger(fieldsToValidate);
  const canProceed = canProceedToNextStep();
 
  if (isValid && canProceed && currentStep < 5) { // ✅ CHANGER ICI
    setCurrentStep(currentStep + 1);
  } else if (!canProceed) {
    alert('Veuillez sélectionner au moins une image');
  }
};
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className={`mb-8 pb-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              currentStep >= step.id
                ? isDarkMode
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-indigo-600 border-indigo-600 text-white'
                : isDarkMode
                  ? 'border-slate-600 text-slate-400'
                  : 'border-slate-300 text-slate-400'
            }`}>
              {currentStep > step.id ? (
                <Check size={16} />
              ) : (
                <span className="text-sm font-semibold">{step.id}</span>
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div className={`h-0.5 w-24 mx-4 transition-all duration-300 ${
                currentStep > step.id
                  ? isDarkMode ? 'bg-indigo-600' : 'bg-indigo-600'
                  : isDarkMode ? 'bg-slate-600' : 'bg-slate-300'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          {STEPS[currentStep - 1].title}
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {STEPS[currentStep - 1].description}
        </p>
      </div>
    </div>
  );

  const renderImageUploadSection = () => (
    <div className={`border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
      <FormField
        label="Images du produit"
        htmlFor="images"
        required
      >
        <div className={`border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
          isDarkMode
            ? 'border-slate-600 hover:border-indigo-500 bg-slate-700/20'
            : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
        }`}>
          <input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={isUploadingImages}
          />
          <label
            htmlFor="images"
            className={`cursor-pointer flex flex-col items-center justify-center space-y-2 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            } ${isUploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload size={32} />
            <span>
              {isUploadingImages ? 'Upload en cours...' : 'Cliquez pour ajouter des images'}
            </span>
            <span className="text-sm">Maximum 10 images</span>
          </label>
        </div>
       
        {imageStates.length > 0 && (
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            {imageStates.map((imageState, index) => (
              <div key={index} className={`relative group border rounded-lg overflow-hidden ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                <Image
                  src={imageState.preview}
                  alt={`Aperçu ${index + 1}`}
                  width={96}
                  height={96}
                  className="w-full h-24 object-cover"
                  unoptimized={imageState.preview.startsWith('blob:')}
                />
               
                {imageState.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 size={20} className="animate-spin mx-auto mb-1" />
                      <div className="text-xs">{imageState.progress}%</div>
                    </div>
                  </div>
                )}
               
                {imageState.error && (
                  <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                    <button
                      onClick={() => {}}
                      className="text-white text-xs bg-white/20 px-2 py-1 rounded"
                    >
                      Réessayer
                    </button>
                  </div>
                )}
               
                {imageState.uploaded && (
                  <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-1">
                    <Check size={10} />
                  </div>
                )}
               
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  disabled={imageState.uploading}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
       
        {isUploadingImages && (
          <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
            <div className="flex items-center space-x-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Upload des images en cours...</span>
            </div>
          </div>
        )}
      </FormField>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <FormField
        label="Nom du produit"
        htmlFor="name"
        error={errors.name?.message}
        required
      >
        <Input
          id="name"
          placeholder="Entrez le nom du produit"
          {...register('name')}
        />
      </FormField>

      <div className={`border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <FormField
          label="Description"
          htmlFor="description"
          error={errors.description?.message}
          required
        >
          <textarea
            id="description"
            placeholder="Décrivez votre produit..."
            rows={4}
            className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 outline-none resize-none ${
              isDarkMode
                ? 'text-white placeholder-slate-400 bg-slate-700/50 border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                : 'text-slate-900 placeholder-slate-400 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent'
            }`}
            {...register('description')}
          />
        </FormField>
      </div>
      <div className={`border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
  <FormField
    label="Description courte (optionnelle)"
    htmlFor="shortDescription"
    error={errors.shortDescription?.message}
  >
    <Input
      id="shortDescription"
      placeholder="Résumé court pour les listings"
      {...register('shortDescription')}
    />
  </FormField>
</div>

<div className={`border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
  <FormField
    label="Prix (€)"
    htmlFor="price"
    error={errors.price?.message}
    required
  >
    <Input
      id="price"
      type="number"
      step="0.01"
      placeholder="0.00"
      {...register('price', { valueAsNumber: true })}
    />
  </FormField>
  
  <FormField
    label="Prix barré (€)"
    htmlFor="comparePrice"
    error={errors.comparePrice?.message}
  >
    <Input
      id="comparePrice"
      type="number"
      step="0.01"
      placeholder="0.00"
      {...register('comparePrice', { 
        setValueAs: (v) => v === '' ? null : parseFloat(v) 
      })}
    />
  </FormField>
</div>

      {renderImageUploadSection()}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <FormField
        label="Catégorie principale"
        htmlFor="categoryId"
        error={errors.categoryId?.message}
        required
      >
        <Select
          options={parentCategories.map(cat => ({ value: cat.id, label: cat.name }))}
          value={watchedCategoryId}
          onValueChange={(value) => setValue('categoryId', value)}
          placeholder="Sélectionnez une catégorie"
        />
      </FormField>

      {subcategories.length > 0 && (
        <div className={`border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <FormField
            label="Sous-catégorie"
            htmlFor="subcategoryId"
            error={errors.subcategoryId?.message}
          >
            <Select
              options={subcategories.map(sub => ({ value: sub.id, label: sub.name }))}
              value={watchedSubcategoryId || ''}
              onValueChange={(value) => setValue('subcategoryId', value)}
              placeholder="Sélectionnez une sous-catégorie (optionnel)"
            />
          </FormField>
        </div>
      )}
      <div className={`border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
  <FormField
    label="Marque"
    htmlFor="brandId"
    error={errors.brandId?.message}
  >
    <Select
      options={brands.map(brand => ({ value: brand.id, label: brand.name }))}
      value={watchedBrandId || ''}
      onValueChange={(value) => setValue('brandId', value)}
      placeholder="Sélectionnez une marque (optionnel)"
    />
  </FormField>
</div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className={`flex items-center justify-between pb-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          Variantes du produit
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addVariant}
          leftIcon={<Plus size={16} />}
        >
          Ajouter une variante
        </Button>
      </div>

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div
            key={index}
            className={`border rounded-xl p-4 ${
              isDarkMode ? 'border-slate-600 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'
            }`}
          >
            <div className={`flex items-center justify-between mb-4 pb-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Variante {index + 1}
              </h5>
              {variants.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariant(index)}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Taille"
                htmlFor={`variant-size-${index}`}
                error={errors.variants?.[index]?.size?.message}
                required
              >
                <Select
                  options={SIZES.map(size => ({ value: size, label: size }))}
                  value={variant.size}
                  onValueChange={(value) => updateVariant(index, 'size', value)}
                  placeholder="Taille"
                />
              </FormField>
              <FormField
                label="Couleur"
                htmlFor={`variant-color-${index}`}
                error={errors.variants?.[index]?.color?.message}
                required
              >
                <div className="space-y-3">
                  <div className={`grid grid-cols-5 gap-2 p-3 border rounded-lg ${isDarkMode ? 'border-slate-600 bg-slate-700/20' : 'border-slate-200 bg-white'}`}>
                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => updateVariant(index, 'color', color.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          variant.color === color.value
                            ? 'border-indigo-500 scale-110 shadow-lg'
                            : isDarkMode 
                              ? 'border-slate-500 hover:scale-105' 
                              : 'border-gray-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  {variant.color && (
                    <div className={`text-sm px-2 py-1 rounded ${isDarkMode ? 'text-slate-300 bg-slate-700' : 'text-slate-600 bg-slate-100'}`}>
                      Couleur: {COLORS.find(c => c.value === variant.color)?.name}
                    </div>
                  )}
                </div>
              </FormField>
              <FormField
                label="Quantité"
                htmlFor={`variant-quantity-${index}`}
                error={errors.variants?.[index]?.quantity?.message}
                required
              >
                <Input
                  id={`variant-quantity-${index}`}
                  type="number"
                  min="0"
                  value={variant.quantity}
                  onChange={(e) => updateVariant(index, 'quantity', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>

      <div className={`border-t pt-6 space-y-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <FormField
          label="Stock total"
          htmlFor="stock"
          error={errors.stock?.message}
          required
        >
          <Input
            id="stock"
            type="number"
            min="0"
            placeholder="0"
            {...register('stock', { valueAsNumber: true })}
          />
        </FormField>

        <div className={`flex items-center space-x-3 p-4 border rounded-lg ${isDarkMode ? 'border-slate-600 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
          <input
            id="available"
            type="checkbox"
            {...register('available')}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label
            htmlFor="available"
            className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
          >
            Produit disponible à la vente
          </label>
        </div>
      </div>
    </div>
  );
const renderStep4 = () => {

  const currentTags = watch('tags') || [];

  const addTag = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      <h4 className={`text-lg font-semibold pb-4 border-b ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>
        Options avancées
      </h4>

      {/* Paramètres de visibilité */}
      <div className={`p-4 border rounded-lg space-y-3 ${isDarkMode ? 'border-slate-600 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
        <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Paramètres de visibilité</h5>
        
        <div className="flex items-center space-x-3">
          <input
            id="featured"
            type="checkbox"
            {...register('featured')}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="featured" className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Produit en vedette
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            id="isNewIn"
            type="checkbox"
            {...register('isNewIn')}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="isNewIn" className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Nouveau produit
          </label>
        </div>
      </div>

      {/* Tags */}
      <div className={`border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <FormField label="Tags" htmlFor="tags">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Ajouter un tag"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus size={16} />
              </Button>
            </div>
            {currentTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentTags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                      isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </FormField>
      </div>

      {/* SEO */}
      <div className={`border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <h5 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>SEO</h5>
        <div className="space-y-4">
          <FormField label="Titre SEO" htmlFor="metaTitle" error={errors.metaTitle?.message}>
            <Input id="metaTitle" placeholder="60 caractères max" {...register('metaTitle')} />
          </FormField>
          <FormField label="Description SEO" htmlFor="metaDescription" error={errors.metaDescription?.message}>
            <textarea
              id="metaDescription"
              rows={3}
              placeholder="160 caractères max"
              className={`w-full px-4 py-3 border rounded-xl ${
                isDarkMode ? 'bg-slate-700/50 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
              }`}
              {...register('metaDescription')}
            />
          </FormField>
        </div>
      </div>

      {/* Dimensions */}
      <div className={`border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <h5 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Dimensions et poids</h5>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField label="Poids (kg)" htmlFor="weight">
            <Input
              id="weight"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('weight', { setValueAs: (v) => v === '' ? null : parseFloat(v) })}
            />
          </FormField>
          <FormField label="Longueur (cm)" htmlFor="length">
            <Input
              id="length"
              type="number"
              step="0.01"
              {...register('dimensions.length', { setValueAs: (v) => v === '' ? 0 : parseFloat(v) })}
            />
          </FormField>
          <FormField label="Largeur (cm)" htmlFor="width">
            <Input
              id="width"
              type="number"
              step="0.01"
              {...register('dimensions.width', { setValueAs: (v) => v === '' ? 0 : parseFloat(v) })}
            />
          </FormField>
          <FormField label="Hauteur (cm)" htmlFor="height">
            <Input
              id="height"
              type="number"
              step="0.01"
              {...register('dimensions.height', { setValueAs: (v) => v === '' ? 0 : parseFloat(v) })}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

  const renderStep5 = () => (
    <div className="space-y-6">
      <h4 className={`text-lg font-semibold mb-4 pb-4 border-b ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>
        Résumé du produit
      </h4>
     
      <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'border-slate-600 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className={`p-6 border-r ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <h5 className={`font-medium mb-4 pb-2 border-b ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>
              Informations générales
            </h5>
            <div className="space-y-3 text-sm">
              <div className={`flex justify-between py-2 px-3 rounded ${isDarkMode ? 'bg-slate-700/50' : 'bg-white'}`}>
                <strong>Nom:</strong> 
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{watchedValues.name}</span>
              </div>
              <div className={`flex justify-between py-2 px-3 rounded ${isDarkMode ? 'bg-slate-700/50' : 'bg-white'}`}>
                <strong>Prix:</strong> 
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{watchedValues.price}€</span>
              </div>
              <div className={`flex justify-between py-2 px-3 rounded ${isDarkMode ? 'bg-slate-700/50' : 'bg-white'}`}>
                <strong>Stock:</strong> 
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{watchedValues.stock}</span>
              </div>
              <div className={`flex justify-between py-2 px-3 rounded ${isDarkMode ? 'bg-slate-700/50' : 'bg-white'}`}>
                <strong>Disponible:</strong> 
                <span className={`font-medium ${watchedValues.available ? 'text-green-500' : 'text-red-500'}`}>
                  {watchedValues.available ? 'Oui' : 'Non'}
                </span>
              </div>
            </div>
          </div>
         
          <div className="p-6">
            <h5 className={`font-medium mb-4 pb-2 border-b ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>
              Catégorisation
            </h5>
            <div className="space-y-3 text-sm">
              <div className={`py-2 px-3 rounded ${isDarkMode ? 'bg-slate-700/50' : 'bg-white'}`}>
                <strong>Catégorie:</strong><br />
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                  {parentCategories.find(c => c.id === watchedValues.categoryId)?.name}
                </span>
              </div>
              {watchedValues.subcategoryId && (
                <div className={`py-2 px-3 rounded ${isDarkMode ? 'bg-slate-700/50' : 'bg-white'}`}>
                  <strong>Sous-catégorie:</strong><br />
                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    {subcategories.find(s => s.id === watchedValues.subcategoryId)?.name}
                  </span>
                </div>
              )}
              {watchedValues.brandId && (
  <div className={`py-2 px-3 rounded ${isDarkMode ? 'bg-slate-700/50' : 'bg-white'}`}>
    <strong>Marque:</strong><br />
    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
      {brands.find(b => b.id === watchedValues.brandId)?.name}
    </span>
  </div>
)}
            </div>
          </div>
          {/* Options avancées */}
<div className="p-6">
  <h5 className={`font-medium mb-4 pb-2 border-b ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>
    Options avancées
  </h5>
  <div className="space-y-2 text-sm">
    <div><strong>En vedette:</strong> {watchedValues.featured ? 'Oui' : 'Non'}</div>
    <div><strong>Nouveau:</strong> {watchedValues.isNewIn ? 'Oui' : 'Non'}</div>
    {watchedValues.tags && watchedValues.tags.length > 0 && (
      <div><strong>Tags:</strong> {watchedValues.tags.join(', ')}</div>
    )}
    {watchedValues.weight && <div><strong>Poids:</strong> {watchedValues.weight} kg</div>}
  </div>
</div>
        </div>
       
        <div className={`p-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <h5 className={`font-medium mb-4 pb-2 border-b ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>
            Variantes ({variants.length})
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {variants.map((variant, index) => (
              <div key={index} className={`p-3 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`}>
                <div className="font-medium mb-2">Variante {index + 1}</div>
                <div className="space-y-1">
                  <div>Taille: <span className="font-medium">{variant.size}</span></div>
                  <div>Couleur: <span className="font-medium">{COLORS.find(c => c.value === variant.color)?.name}</span></div>
                  <div>Quantité: <span className="font-medium">{variant.quantity}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`p-6 rounded-xl transition-all duration-300 border backdrop-blur-sm shadow-lg ${
      isDarkMode
        ? 'bg-slate-800/50 border-slate-700'
        : 'bg-white/70 border-slate-200'
    }`}>
     
      {renderStepIndicator()}
     
      <div className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
       
        <div className={`flex justify-between pt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <Button
            type="button"
            variant="secondary"
            onClick={prevStep}
            disabled={currentStep === 1}
            leftIcon={<ChevronLeft size={16} />}
          >
            Précédent
          </Button>
         
          {currentStep < 5 ? (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
              rightIcon={<ChevronRight size={16} />}
            >
              Suivant
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              onClick={handleSubmit(handleFormSubmit)}
            >
              {submitButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}