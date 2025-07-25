// components/forms/ProductForm.tsx (version modifiée)
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

    // Créer les états initiaux pour les nouvelles images
    const newImageStates: ImageUploadState[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false,
      progress: 0
    }));

    setImageStates(prev => [...prev, ...newImageStates]);
    
    // Commencer les uploads
    setIsUploadingImages(true);
    
    for (let i = imageStates.length; i < imageStates.length + files.length; i++) {
      const fileIndex = i - imageStates.length;
      uploadSingleImage(i, files[fileIndex]);
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

  // Modifier la fonction de soumission pour inclure les URLs Cloudinary
  const handleFormSubmit: SubmitHandler<ProductFormData> = async (data: ProductFormData) => {
    // Vérifier que tous les uploads sont terminés
    const hasUploadingImages = imageStates.some(state => state.uploading);
    if (hasUploadingImages) {
      alert('Veuillez attendre que tous les uploads d\'images soient terminés');
      return;
    }

    // Récupérer les URLs des images uploadées avec succès
    const uploadedImageUrls = imageStates
      .filter(state => state.uploaded && state.cloudinaryUrl)
      .map(state => state.cloudinaryUrl!);

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
  };

  // Fonction pour vérifier si on peut passer à l'étape suivante
  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      // Vérifier que les images sont uploadées
      const hasImages = imageStates.length > 0;
      const allImagesUploaded = imageStates.every(state => state.uploaded);
      const hasUploadErrors = imageStates.some(state => state.error);
      
      return hasImages && allImagesUploaded && !hasUploadErrors && !isUploadingImages;
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
      alert('Veuillez uploader au moins une image et attendre que tous les uploads soient terminés');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Fonction pour rendre la section d'upload d'images mise à jour
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

  // Le reste de votre code reste identique, mais remplacez la section d'upload d'images
  // dans renderStep1() par un appel à renderImageUploadSection()

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

  // Le reste de votre code reste identique...
  // (renderStep2, renderStep3, renderStep4, renderStepIndicator, etc.)

  return (
    <div className={`p-6 rounded-xl transition-all duration-300 border backdrop-blur-sm shadow-lg ${
      isDarkMode
        ? 'bg-slate-800/50 border-slate-700'
        : 'bg-white/70 border-slate-200'
    }`}>
      {/* renderStepIndicator() */}
      
      <div className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {/* Autres étapes... */}
        
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
              disabled={!canProceedToNextStep()}
              rightIcon={<ChevronRight size={16} />}
            >
              Suivant
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting || isUploadingImages}
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