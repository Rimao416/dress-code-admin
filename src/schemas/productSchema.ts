// schemas/productSchema.ts
import { z } from 'zod';

export const variantSchema = z.object({
  size: z.string().min(1, 'La taille est requise'),
  color: z.string().min(1, 'La couleur est requise'),
  quantity: z.number().min(0, 'La quantité doit être positive'),
});

// Schéma pour le formulaire (avec File[])
export const productSchema = z.object({
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
   
  categoryId: z.string().min(1, 'La catégorie est requise'),
  subcategoryId: z.string().optional(),
  variants: z.array(variantSchema).min(1, 'Au moins une variante est requise'),
  stock: z.number().min(0, 'Le stock ne peut pas être négatif'),
  available: z.boolean(),
});

// Schéma pour l'API (avec string[])
export const apiProductSchema = z.object({
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
   
  images: z.array(z.string()).min(1, 'Au moins une image est requise'),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  subcategoryId: z.string().optional(),
  variants: z.array(variantSchema).min(1, 'Au moins une variante est requise'),
  stock: z.number().min(0, 'Le stock ne peut pas être négatif'),
  available: z.boolean(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type ApiProductData = z.infer<typeof apiProductSchema>;