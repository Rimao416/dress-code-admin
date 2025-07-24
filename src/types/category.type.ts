// types/category.type.ts

export type CategoryBase = {
  name: string;
  description?: string;
};

export type Category = CategoryBase & {
  id: string;
  slug?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type CategoryFormData = CategoryBase;

export type CreateCategoryData = CategoryBase;

export type UpdateCategoryData = CategoryBase & {
  id: string;
};
