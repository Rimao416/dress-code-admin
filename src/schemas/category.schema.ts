// schemas/category.schema.ts
import { z } from 'zod'

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  
  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  
  parentId: z
    .string()
    .nullable() // Permet null
    .optional(), // Et undefined
  
  image: z
    .string()
    .url('L\'URL de l\'image n\'est pas valide')
    .optional()
    .or(z.literal('')),
  
  isActive: z
    .boolean()
    .default(true)
    .optional(),
  
  sortOrder: z
    .number()
    .min(0, 'L\'ordre de tri ne peut pas être négatif')
    .max(9999, 'L\'ordre de tri ne peut pas dépasser 9999')
    .default(0)
    .optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>