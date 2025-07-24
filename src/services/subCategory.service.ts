// services/subCategory.service.ts
import { SubCategory, CreateSubCategoryData, UpdateSubCategoryData } from '@/types/subCategory.type';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Obtenir toutes les sous-catégories
export const getSubCategories = async (): Promise<SubCategory[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subcategories`);
    if (!response.ok) {
      throw new Error(`Échec de la récupération des sous-catégories: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des sous-catégories:', error);
    throw error;
  }
};

// Obtenir une sous-catégorie par ID
export const getSubCategoryById = async (id: string): Promise<SubCategory> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subcategories/${id}`);
    if (!response.ok) {
      throw new Error(`Échec de la récupération de la sous-catégorie: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération de la sous-catégorie:', error);
    throw error;
  }
};

// Créer une nouvelle sous-catégorie
export const createSubCategory = async (data: CreateSubCategoryData): Promise<SubCategory> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subcategories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Échec de la création de la sous-catégorie: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création de la sous-catégorie:', error);
    throw error;
  }
};

// Mettre à jour une sous-catégorie
export const updateSubCategory = async (id: string, data: UpdateSubCategoryData): Promise<SubCategory> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subcategories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Échec de la mise à jour de la sous-catégorie: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la sous-catégorie:', error);
    throw error;
  }
};

// Supprimer une sous-catégorie
export const deleteSubCategory = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subcategories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Échec de la suppression de la sous-catégorie: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la sous-catégorie:', error);
    throw error;
  }
};