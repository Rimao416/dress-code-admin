// store/subCategoryStore.ts
import { SubCategory } from '@/types/subCategory.type';
import { create } from 'zustand'

interface SubCategoryStore {
  subCategories: SubCategory[];
  selectedSubCategory: SubCategory | null;
  loading: boolean;
  error: string | null;
  setSubCategories: (subCategories: SubCategory[]) => void;
  selectSubCategory: (subCategory: SubCategory) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const useSubCategoryStore = create<SubCategoryStore>((set) => ({
  subCategories: [],
  selectedSubCategory: null,
  loading: false,
  error: null,
  setSubCategories: (subCategories) => set({ subCategories }),
  selectSubCategory: (selectedSubCategory) => set({ selectedSubCategory }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

export default useSubCategoryStore