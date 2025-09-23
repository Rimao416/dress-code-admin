// stores/categoryStore.ts
import { create } from 'zustand';
import { Category, CategoryHierarchy } from '@/types/category.type';

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;
 
  // Actions
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (updatedCategory: Category) => void;
  deleteCategory: (id: string) => void;
  selectCategory: (category: Category | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
 
  // Helper methods
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesHierarchy: () => CategoryHierarchy[];
  getRootCategories: () => Category[];
  getChildrenCategories: (parentId: string) => Category[];
  getCategoryPath: (categoryId: string) => Category[];
  getAllParentIds: (categoryId: string) => string[];
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,

  setCategories: (categories) => set({ categories }),
  
  addCategory: (category) =>
    set((state) => ({
      categories: [...state.categories, category],
    })),

  updateCategory: (updatedCategory) =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      ),
    })),

  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== id),
    })),

  selectCategory: (category) => set({ selectedCategory: category }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Helper methods
  getCategoryById: (id: string) => {
    const { categories } = get();
    return categories.find(category => category.id === id);
  },

  getCategoriesHierarchy: () => {
    const { categories } = get();
    
    const buildHierarchy = (parentId: string | null = null, level: number = 0): CategoryHierarchy[] => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map(category => {
          const children = buildHierarchy(category.id, level + 1);
          const path = get().getCategoryPath(category.id).map(c => c.name);
          
          return {
            ...category,
            level,
            hasChildren: children.length > 0,
            path,
            children: children as Category[]
          };
        });
    };

    return buildHierarchy();
  },

  getRootCategories: () => {
    const { categories } = get();
    return categories.filter(category => !category.parentId);
  },

  getChildrenCategories: (parentId: string) => {
    const { categories } = get();
    return categories.filter(category => category.parentId === parentId);
  },

  getCategoryPath: (categoryId: string) => {
    const { categories, getCategoryById } = get();
    const path: Category[] = [];
    let currentCategory = getCategoryById(categoryId);
    
    while (currentCategory) {
      path.unshift(currentCategory);
      currentCategory = currentCategory.parentId 
        ? getCategoryById(currentCategory.parentId) 
        : undefined;
    }
    
    return path;
  },

  getAllParentIds: (categoryId: string) => {
    const path = get().getCategoryPath(categoryId);
    return path.slice(0, -1).map(cat => cat.id); // Exclude the category itself
  }
}));