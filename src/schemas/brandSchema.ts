// schemas/brandSchema.ts
import { z } from 'zod';

// Schéma pour le formulaire
export const brandSchema = z.object({
  name: z.string()
    .min(1, 'Le nom de la marque est requis')
    .min(2, 'Le nom de la marque doit contenir au moins 2 caractères')
    .max(100, 'Le nom de la marque ne doit pas dépasser 100 caractères'),
   
  description: z.string()
    .max(500, 'La description ne doit pas dépasser 500 caractères')
    .optional()
    .nullable(),
   
  logo: z.string()
    .url('Le logo doit être une URL valide')
    .optional()
    .nullable(),
   
  website: z.string()
    .url('Le site web doit être une URL valide')
    .optional()
    .nullable(),
   
  isActive: z.boolean().default(true),
});

// Schéma pour l'API
export const apiBrandSchema = z.object({
  name: z.string()
    .min(1, 'Le nom de la marque est requis')
    .min(2, 'Le nom de la marque doit contenir au moins 2 caractères')
    .max(100, 'Le nom de la marque ne doit pas dépasser 100 caractères'),
   
  description: z.string()
    .max(500, 'La description ne doit pas dépasser 500 caractères')
    .optional()
    .nullable(),
   
  logo: z.string()
    .url('Le logo doit être une URL valide')
    .optional()
    .nullable(),
   
  website: z.string()
    .url('Le site web doit être une URL valide')
    .optional()
    .nullable(),
   
  isActive: z.boolean().default(true),
});

export type BrandFormData = z.infer<typeof brandSchema>;
export type ApiBrandData = z.infer<typeof apiBrandSchema>;