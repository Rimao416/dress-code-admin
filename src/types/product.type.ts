// =============================================
// types/product.type.ts
// =============================================

// ✅ AJOUTER ce type au début du fichier
export type ProductDimensions = {
  length: number;
  width: number;
  height: number;
};

export type ProductBase = {
  name: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  comparePrice?: number | null;
  images: string[];
  categoryId: string;
  subcategoryId?: string;
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
  dimensions?: ProductDimensions | null; // ✅ CHANGER ICI
};

// Nouveau type pour les variants du formulaire
export type FormVariant = {
  size: string;
  color: string;
  quantity: number;
};

// Type pour les variants en base de données
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
  parentId?: string | null;
};

export type Brand = {
  id: string;
  name: string;
};

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
};

// ✅ Type pour les statistiques calculées
export type ProductStats = {
  totalStock: number;
  availableSizes: string[];
  availableColors: string[];
  avgRating: number;
  totalReviews: number;
  totalFavorites: number;
  totalOrders: number;
};

// ✅ Type Product complet avec stats
export type Product = ProductBase & {
  id: string;
  slug: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  category?: Category;
  subcategory?: Category;
  brand?: Brand | null;
  variants?: ProductVariant[];
  reviews?: Review[];
  _count?: {
    variants: number;
    reviews: number;
    orderItems: number;
    favorites: number;
    cartItems: number;
  };
  stats?: ProductStats;
};

export type ProductFormData = ProductBase;

export type CreateProductData = ProductBase & {
  variants?: FormVariant[];
};

export type UpdateProductData = ProductBase & {
  id: string;
  variants?: FormVariant[];
};