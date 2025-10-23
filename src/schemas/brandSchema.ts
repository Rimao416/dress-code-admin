// schemas/brandSchema.ts
import { z } from 'zod'

export const brandSchema = z.object({
  name: z.string()
    .min(2, 'Le nom de la marque doit contenir au moins 2 caractères')
    .max(100, 'Le nom de la marque ne doit pas dépasser 100 caractères'),
   
  description: z.string()
    .max(500, 'La description ne doit pas dépasser 500 caractères')
    .optional(),
   
  logo: z.union([
    z.string().url('Le logo doit être une URL valide'),
    z.literal('')
  ]).optional(),
   
  website: z.union([
    z.string().url('Le site web doit être une URL valide'),
    z.literal('')
  ]).optional(),
   
  isActive: z.boolean(), // ✅ Requis, pas de .default()
})

export type BrandFormData = z.infer<typeof brandSchema>