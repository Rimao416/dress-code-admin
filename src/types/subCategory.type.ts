// types/subCategory.type.ts
export type SubCategoryBase = {
  name: string;
  categoryId: string;
};

export type SubCategory = SubCategoryBase & {
  id: string;
  category: {
    id: string;
    name: string;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type SubCategoryFormData = SubCategoryBase;
export type CreateSubCategoryData = SubCategoryBase;
export type UpdateSubCategoryData = SubCategoryBase & {
  id: string;
};