// types/brand.type.ts
import { BrandFormData } from '@/schemas/brandSchema' // ✅ Importez depuis le schéma

export type BrandBase = {
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  isActive: boolean; // ✅ Retirez le ? pour le rendre requis
};

export type Brand = BrandBase & {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    products: number;
  };
};

// ✅ Supprimez cette ligne (utilisez l'import à la place)
// export type BrandFormData = BrandBase;

export type CreateBrandData = BrandBase;

export type UpdateBrandData = BrandBase & {
  id: string;
};