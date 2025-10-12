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
  subcategoryId?: string; // ✅ Ajouté
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

// ✅ Nouveau type pour les variants du formulaire (différent de ProductVariant de la DB)
export type FormVariant = {
  size: string;
  color: string;
  quantity: number;
};

export type Product = ProductBase & {
  id: string;
  slug: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  category?: Category;
  subcategory?: Category; // ✅ Ajouté
  brand?: Brand | null;
  variants?: ProductVariant[];
  _count?: {
    variants: number;
    reviews: number;
    orderItems: number;
  };
};

export type ProductFormData = ProductBase;

// ✅ CreateProductData accepte les variants du formulaire
export type CreateProductData = ProductBase & {
  variants?: FormVariant[]; // ✅ Ajouté
};

export type UpdateProductData = ProductBase & {
  id: string;
  variants?: FormVariant[]; // ✅ Ajouté si nécessaire pour l'update
};

// Type pour les variants en base de données (reste inchangé)
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
  parentId?: string | null; // ✅ Ajouté pour supporter les sous-catégories
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
};