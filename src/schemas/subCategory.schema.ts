// schemas/subCategory.schema.ts
import { z } from 'zod';

export const subCategorySchema = z.object({
  name: z.string()
    .min(1, 'Le nom de la sous-catégorie est requis')
    .min(2, 'Le nom de la sous-catégorie doit contenir au moins 2 caractères')
    .max(100, 'Le nom de la sous-catégorie ne doit pas dépasser 100 caractères'),
  categoryId: z.string().min(1, 'La catégorie est requise'),
});

export type SubCategoryFormData = z.infer<typeof subCategorySchema>;