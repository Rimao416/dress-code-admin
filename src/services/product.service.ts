// services/product.service.ts
import { Product, CreateProductData, UpdateProductData } from '@/types/product.type';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Obtenir tous les produits
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
   
    if (!response.ok) {
      throw new Error(`Échec de la récupération des produits: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    throw error;
  }
};

// Obtenir un produit par ID
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
   
    if (!response.ok) {
      throw new Error(`Échec de la récupération du produit: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    throw error;
  }
};

// Créer un nouveau produit
export const createProduct = async (data: CreateProductData): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
   
    if (!response.ok) {
      throw new Error(`Échec de la création du produit: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    throw error;
  }
};

// Mettre à jour un produit
export const updateProduct = async (data: UpdateProductData): Promise<Product> => {
  try {
    const { id, ...updateData } = data;
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
   
    if (!response.ok) {
      throw new Error(`Échec de la mise à jour du produit: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    throw error;
  }
};

// Supprimer un produit
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
   
    if (!response.ok) {
      throw new Error(`Échec de la suppression du produit: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    throw error;
  }
};

// Obtenir les produits par catégorie
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}`);
   
    if (!response.ok) {
      throw new Error(`Échec de la récupération des produits par catégorie: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des produits par catégorie:', error);
    throw error;
  }
};

// Obtenir les produits par sous-catégorie
export const getProductsBySubCategory = async (subcategoryId: string): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/subcategory/${subcategoryId}`);
   
    if (!response.ok) {
      throw new Error(`Échec de la récupération des produits par sous-catégorie: ${response.statusText}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des produits par sous-catégorie:', error);
    throw error;
  }
};