import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom de la marque doit contenir au moins 2 caractères")
    .max(100, "Le nom de la marque ne doit pas dépasser 100 caractères"),
  description: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  isActive: z.boolean(), // Retirez le .default(true)
});

export type BrandFormData = z.infer<typeof brandSchema>;