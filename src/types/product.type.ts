// types/product.type.ts

export type VariantBase = {
  size: string;
  color: string;
  quantity: number;
};

export type Variant = VariantBase & {
  id: string;
  productId: string;
};

export type ProductBase = {
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  subcategoryId?: string;
  stock: number;
  available: boolean;
};

export type Product = ProductBase & {
  id: string;
  createdAt: string | Date;
  category: {
    id: string;
    name: string;
  };
  variants: Variant[];
};

export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  images: File[];
  categoryId: string;
  subcategoryId?: string | null; // Accepter null ET undefined
  variants: VariantBase[];
  stock: number;
  available: boolean;
};

export type CreateProductData = Omit<ProductFormData, 'images'> & {
  images: string[];
};

export type UpdateProductData = CreateProductData & {
  id: string;
};