// schemas/product.schema.ts
import { z } from 'zod';

export const variantSchema = z.object({
  size: z.string().min(1, 'La taille est requise'),
  color: z.string().min(1, 'La couleur est requise'),
  quantity: z.number().min(0, 'La quantité doit être positive'),
});

export const productSchema = z.object({
  // Étape 1 - Informations générales
  name: z.string()
    .min(1, 'Le nom du produit est requis')
    .min(2, 'Le nom du produit doit contenir au moins 2 caractères')
    .max(200, 'Le nom du produit ne doit pas dépasser 200 caractères'),
   
  description: z.string()
    .min(1, 'La description est requise')
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(1000, 'La description ne doit pas dépasser 1000 caractères'),
   
  price: z.number()
    .min(0.01, 'Le prix doit être supérieur à 0')
    .max(999999.99, 'Le prix ne peut pas dépasser 999 999,99'),
   
  images: z.array(z.instanceof(File))
    .min(1, 'Au moins une image est requise')
    .max(10, 'Maximum 10 images autorisées'),
   
  // Étape 2 - Catégorisation
  categoryId: z.string().min(1, 'La catégorie est requise'),
  subcategoryId: z.string().optional(),
 
  // Étape 3 - Déclinaisons
  variants: z.array(variantSchema)
    .min(1, 'Au moins une variante est requise'),
   
  // Étape 4 - Stock et disponibilité
  stock: z.number()
    .min(0, 'Le stock ne peut pas être négatif'),
   
  // Changement ici : available doit être boolean, pas optional avec default
  available: z.boolean(),
});

export type ProductFormData = z.infer<typeof productSchema>;