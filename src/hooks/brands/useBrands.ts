// hooks/brands/useBrands.ts
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getBrands } from '@/services/brand.service';
import { useBrandStore } from '@/store/brandStore';

interface UseBrandsOptions {
  isActive?: boolean;
  search?: string;
}

export const useBrands = (options?: UseBrandsOptions) => {
  const { brands, setBrands, setError, setLoading } = useBrandStore();
  const store = useBrandStore();
  console.log(store);

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['brands', options],
    queryFn: () => getBrands(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    setLoading(isLoading || isFetching);
  }, [isLoading, isFetching, setLoading]);

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      const formattedData = data.map(brand => ({
        ...brand,
        createdAt: typeof brand.createdAt === 'string' 
          ? new Date(brand.createdAt) 
          : brand.createdAt,
        updatedAt: typeof brand.updatedAt === 'string' 
          ? new Date(brand.updatedAt) 
          : brand.updatedAt,
      }));
      console.log('Marques formatées et stockées:', formattedData);
      setBrands(formattedData);
    } else if (data && Array.isArray(data) && data.length === 0) {
      setBrands([]);
    }
  }, [data, setBrands]);

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      console.error('Erreur marques:', message);
      setError(message);
    }
  }, [error, setError]);

  return {
    data: brands,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};