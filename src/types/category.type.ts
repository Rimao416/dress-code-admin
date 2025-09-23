// types/category.type.ts

export type CategoryBase = {
  name: string;
  description?: string;
  parentId?: string | null; // Correction : permet null explicitement
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type Category = CategoryBase & {
  id: string;
  slug: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    products: number;
    children: number;
  };
};

export type CategoryFormData = CategoryBase;

export type CreateCategoryData = CategoryBase;

export type UpdateCategoryData = CategoryBase & {
  id: string;
};

export type CategoryHierarchy = Category & {
  level: number;
  hasChildren: boolean;
  path: string[];
};