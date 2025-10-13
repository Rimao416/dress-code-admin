// services/brand.service.ts
import { Brand, CreateBrandData, UpdateBrandData } from '@/types/brand.type';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface GetBrandsOptions {
  isActive?: boolean;
  search?: string;
}

// Obtenir toutes les marques
export const getBrands = async (options?: GetBrandsOptions): Promise<Brand[]> => {
  try {
    const params = new URLSearchParams();
    if (options?.isActive !== undefined) params.append('isActive', String(options.isActive));
    if (options?.search) params.append('search', options.search);

    const response = await fetch(`${API_BASE_URL}/brands?${params}`);
    
    if (!response.ok) {
      throw new Error(`Échec de la récupération des marques: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Réponse brute de l\'API marques:', data);

    return data.brands || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des marques:', error);
    throw error;
  }
};

// Obtenir une marque par ID
export const getBrandById = async (id: string): Promise<Brand> => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands/${id}`);
   
    if (!response.ok) {
      throw new Error(`Échec de la récupération de la marque: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération de la marque:', error);
    throw error;
  }
};

// Créer une nouvelle marque
export const createBrand = async (data: CreateBrandData): Promise<Brand> => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
   
    if (!response.ok) {
      throw new Error(`Échec de la création de la marque: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création de la marque:', error);
    throw error;
  }
};

// Mettre à jour une marque
export const updateBrand = async (data: UpdateBrandData): Promise<Brand> => {
  try {
    const { id, ...updateData } = data;
    const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
   
    if (!response.ok) {
      throw new Error(`Échec de la mise à jour de la marque: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la marque:', error);
    throw error;
  }
};

// Supprimer une marque
export const deleteBrand = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
      method: 'DELETE',
    });
   
    if (!response.ok) {
      throw new Error(`Échec de la suppression de la marque: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la marque:', error);
    throw error;
  }
};