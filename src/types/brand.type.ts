// types/brand.type.ts

export type BrandBase = {
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  isActive?: boolean;
};

export type Brand = BrandBase & {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    products: number;
  };
};

export type BrandFormData = BrandBase;

export type CreateBrandData = BrandBase;

export type UpdateBrandData = BrandBase & {
  id: string;
};