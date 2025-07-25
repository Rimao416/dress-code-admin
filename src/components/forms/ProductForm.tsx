// components/forms/ProductForm.tsx (version complète avec Cloudinary)
'use client'
import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Product } from '@/types/product.type'
import { useTheme } from '@/context/ThemeContext'
import { ChevronLeft, ChevronRight, Upload, X, Plus, Check, Loader2 } from 'lucide-react'
import FormField from '../ui/formfield'
import Input from '../ui/input'
import Select from '../ui/select'
import Button from '../ui/button'
import { productSchema, ProductFormData } from '@/schemas/productSchema'
import { CloudinaryService } from '@/services/cloudinary.service'

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: Product;
  isSubmitting: boolean;
  submitButtonText: string;
  categories: Array<{ id: string; name: string }>;
  subcategories: Array<{ id: string; name: string; categoryId: string }>;
}

const STEPS = [
  { id: 1, title: 'Informations générales', description: 'Détails de base du produit' },
  { id: 2, title: 'Catégorisation', description: 'Classification du produit' },
  { id: 3, title: 'Déclinaisons', description: 'Variantes disponibles' },
  { id: 4, title: 'Résumé', description: 'Vérification finale' }
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
  categories,
  subcategories
}: ProductFormProps) {
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [imageStates, setImageStates] = useState<ImageUploadState[]>([]);
  const [variants, setVariants] = useState([{ size: '', color: '', quantity: 0 }]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
    trigger
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      variants: [{ size: '', color: '', quantity: 0 }],
      available: true,
      stock: 0
    }
  });

  const watchedCategoryId = watch('categoryId');
  const watchedValues = watch();

  const filteredSubcategories = subcategories.filter(
    sub => sub.categoryId === watchedCategoryId
  );

  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name);
      setValue('description', initialData.description);
      setValue('price', initialData.price);
      setValue('categoryId', initialData.categoryId);
      setValue('stock', initialData.stock);
      setValue('available', initialData.available);
     
      if (initialData.variants.length > 0) {
        setVariants(initialData.variants);
        setValue('variants', initialData.variants);
      }
      
      // Gérer les images existantes
      if (initialData.images && initialData.images.length > 0) {
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
    }
  }, [initialData, setValue]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;
  
  // Créer les états pour les nouvelles images SANS les uploader
  const newImageStates: ImageUploadState[] = files.map(file => ({
    file,
    preview: URL.createObjectURL(file),
    uploading: false,
    uploaded: false, // Important: pas encore uploadé
    progress: 0
  }));
  
  setImageStates(prev => [...prev, ...newImageStates]);
};
const uploadAllImages = async (): Promise<string[]> => {
  const imagesToUpload = imageStates.filter(state => !state.uploaded && !state.error);
  
  if (imagesToUpload.length === 0) {
    // Retourner les URLs des images déjà uploadées
    return imageStates
      .filter(state => state.uploaded && state.cloudinaryUrl)
      .map(state => state.cloudinaryUrl!);
  }

  setIsUploadingImages(true);
  
  const uploadPromises = imagesToUpload.map(async (imageState, index) => {
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
    
    // Retourner toutes les URLs (nouvelles + anciennes)
    const existingUrls = imageStates
      .filter(state => state.uploaded && state.cloudinaryUrl && !imagesToUpload.includes(state))
      .map(state => state.cloudinaryUrl!);
    
    return [...existingUrls, ...uploadedUrls];
  } catch (error) {
    setIsUploadingImages(false);
    throw error;
  }
};

  const uploadSingleImage = async (index: number, file: File) => {
    // Marquer comme en cours d'upload
    setImageStates(prev => prev.map((state, i) =>
      i === index ? { ...state, uploading: true, error: undefined } : state
    ));

    try {
      const result = await CloudinaryService.uploadImageWithProgress(
        file,
        (progress) => {
          setImageStates(prev => prev.map((state, i) =>
            i === index ? { ...state, progress } : state
          ));
        }
      );

      // Marquer comme uploadé avec succès
      setImageStates(prev => prev.map((state, i) =>
        i === index ? {
          ...state,
          uploading: false,
          uploaded: true,
          cloudinaryUrl: result.secure_url,
          progress: 100
        } : state
      ));
    } catch (error) {
      // Marquer l'erreur
      setImageStates(prev => prev.map((state, i) =>
        i === index ? {
          ...state,
          uploading: false,
          uploaded: false,
          error: error instanceof Error ? error.message : 'Upload failed',
          progress: 0
        } : state
      ));
    } finally {
      // Vérifier si tous les uploads sont terminés
      setImageStates(prev => {
        const allFinished = prev.every(state => !state.uploading);
        if (allFinished) {
          setIsUploadingImages(false);
        }
        return prev;
      });
    }
  };

  const removeImage = async (index: number) => {
    const imageState = imageStates[index];
   
    // Supprimer de Cloudinary si l'image a été uploadée
    if (imageState.uploaded && imageState.cloudinaryUrl) {
      // Extraire le public_id de l'URL Cloudinary
      const publicId = imageState.cloudinaryUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        await CloudinaryService.deleteImage(publicId);
      }
    }

    // Révoquer l'URL de prévisualisation
    if (imageState.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageState.preview);
    }

    // Supprimer de l'état
    setImageStates(prev => prev.filter((_, i) => i !== index));
  };

  const retryImageUpload = (index: number) => {
    const imageState = imageStates[index];
    if (imageState.file && !imageState.uploaded) {
      uploadSingleImage(index, imageState.file);
    }
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

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
    setValue('variants', newVariants);
  };

  // Modifier la fonction de soumission pour inclure les URLs Cloudinary
 const handleFormSubmit: SubmitHandler<ProductFormData> = async (data: ProductFormData) => {
  try {
    // Upload toutes les images d'abord
    const uploadedImageUrls = await uploadAllImages();
    
    if (uploadedImageUrls.length === 0) {
      alert('Veuillez ajouter au moins une image');
      return;
    }

    // Ajouter les URLs des images aux données du formulaire
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


  // Fonction pour vérifier si on peut passer à l'étape suivante
 const canProceedToNextStep = () => {
  if (currentStep === 1) {
    // Vérifier qu'il y a au moins une image sélectionnée
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
  }
  
  const isValid = await trigger(fieldsToValidate);
  const canProceed = canProceedToNextStep();
 
  if (isValid && canProceed && currentStep < 4) {
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

  // Fonction pour rendre la section d'upload d'images
  const renderImageUploadSection = () => (
    <div className={`border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
      <FormField
        label="Images du produit"
        htmlFor="images"
        error={errors.images?.message}
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
                <img
                  src={imageState.preview}
                  alt={`Aperçu ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
               
                {/* Overlay de statut */}
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
                      onClick={() => retryImageUpload(index)}
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
               
                {/* Bouton de suppression */}
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
       
        {/* Barre de progression globale */}
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
          options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
          value={watchedCategoryId}
          onValueChange={(value) => setValue('categoryId', value)}
          placeholder="Sélectionnez une catégorie"
        />
      </FormField>

      {filteredSubcategories.length > 0 && (
        <div className={`border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <FormField
            label="Sous-catégorie"
            htmlFor="subcategoryId"
            error={errors.subcategoryId?.message}
          >
            <Select
              options={filteredSubcategories.map(sub => ({ value: sub.id, label: sub.name }))}
              value={watch('subcategoryId') || ''}
              onValueChange={(value) => setValue('subcategoryId', value)}
              placeholder="Sélectionnez une sous-catégorie (optionnel)"
            />
          </FormField>
        </div>
      )}
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
 const renderStep4 = () => (
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
                  {categories.find(c => c.id === watchedValues.categoryId)?.name}
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
         
          {currentStep < 4 ? (
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