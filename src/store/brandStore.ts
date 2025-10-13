// store/brandStore.ts
import { create } from 'zustand';
import { Brand } from '@/types/brand.type';

interface BrandState {
  brands: Brand[];
  selectedBrand: Brand | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setBrands: (brands: Brand[]) => void;
  addBrand: (brand: Brand) => void;
  updateBrand: (updatedBrand: Brand) => void;
  deleteBrand: (id: string) => void;
  selectBrand: (brand: Brand | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Helper methods
  getBrandById: (id: string) => Brand | undefined;
  searchBrands: (query: string) => Brand[];
}

export const useBrandStore = create<BrandState>((set, get) => ({
  brands: [],
  selectedBrand: null,
  isLoading: false,
  error: null,

  setBrands: (brands) => set({ brands }),
  
  addBrand: (brand) =>
    set((state) => ({
      brands: [...state.brands, brand],
    })),

  updateBrand: (updatedBrand) =>
    set((state) => ({
      brands: state.brands.map((brand) =>
        brand.id === updatedBrand.id ? updatedBrand : brand
      ),
    })),

  deleteBrand: (id) =>
    set((state) => ({
      brands: state.brands.filter((brand) => brand.id !== id),
    })),

  selectBrand: (brand) => set({ selectedBrand: brand }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Helper methods
  getBrandById: (id: string) => {
    const { brands } = get();
    return brands.find(brand => brand.id === id);
  },

  searchBrands: (query: string) => {
    const { brands } = get();
    const lowerQuery = query.toLowerCase();
    return brands.filter(brand =>
      brand.name.toLowerCase().includes(lowerQuery) ||
      (brand.description && brand.description.toLowerCase().includes(lowerQuery))
    );
  },
}));