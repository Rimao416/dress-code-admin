// services/category.service.ts
import { Category, CreateCategoryData, UpdateCategoryData } from '@/types/category.type';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Obtenir toutes les catégories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
   
    if (!response.ok) {
      throw new Error(`Échec de la récupération des catégories: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    throw error;
  }
};

// Obtenir une catégorie par ID
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
   
    if (!response.ok) {
      throw new Error(`Échec de la récupération de la catégorie: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    throw error;
  }
};

// Créer une nouvelle catégorie
export const createCategory = async (data: CreateCategoryData): Promise<Category> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
   
    if (!response.ok) {
      throw new Error(`Échec de la création de la catégorie: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    throw error;
  }
};

// Mettre à jour une catégorie
export const updateCategory = async (data: UpdateCategoryData): Promise<Category> => {
  try {
    const { id, ...updateData } = data;
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
   
    if (!response.ok) {
      throw new Error(`Échec de la mise à jour de la catégorie: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    throw error;
  }
};

// Supprimer une catégorie
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
   
    if (!response.ok) {
      throw new Error(`Échec de la suppression de la catégorie: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    throw error;
  }
};