// store/productStore.ts
import { Product } from '@/types/product.type';
import { create } from 'zustand'

interface ProductStore {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  setProducts: (products: Product[]) => void;
  selectProduct: (product: Product) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  setProducts: (products) => set({ products }),
  selectProduct: (selectedProduct) => set({ selectedProduct }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))