// schemas/categorySchema.ts
import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string()
    .min(1, 'Le nom de la catégorie est requis')
    .min(2, 'Le nom de la catégorie doit contenir au moins 2 caractères')
    .max(100, 'Le nom de la catégorie ne doit pas dépasser 100 caractères'),
  description: z.string().optional().nullable(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;