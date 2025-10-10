// =============================================
// 1. TYPES - types/product.type.ts
// =============================================

export type ProductBase = {
  name: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  comparePrice?: number | null;
  images: string[];
  categoryId: string;
  brandId?: string | null;
  sku: string;
  stock?: number;
  available?: boolean;
  featured?: boolean;
  isNewIn?: boolean;
  tags?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  weight?: number | null;
  dimensions?: JSON | null;
};

export type Product = ProductBase & {
  id: string;
  slug: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  category?: Category;
  brand?: Brand | null;
  variants?: ProductVariant[];
  _count?: {
    variants: number;
    reviews: number;
    orderItems: number;
  };
};

export type ProductFormData = ProductBase;

export type CreateProductData = ProductBase;

export type UpdateProductData = ProductBase & {
  id: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  size?: string | null;
  color?: string | null;
  colorHex?: string | null;
  material?: string | null;
  sku: string;
  price?: number | null;
  stock: number;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
};
