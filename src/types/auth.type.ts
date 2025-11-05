// types/auth.types.ts
// Fichier centralisé pour tous les types d'authentification

import { Gender } from '../generated/prisma';

// Interface pour l'utilisateur authentifié (unifiée)
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  client?: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: Gender; // Utilise le type Gender de Prisma
  };
}

// Types pour les données d'inscription
export interface UserData {
  // Authentication information
  email: string;
  password: string;
 
  // Personal information
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth?: string;
  gender?: Gender;
 
  // User preferences
  acceptedTerms: boolean;
  acceptedMarketing: boolean;
 
  // Address (optional)
  country?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  addressComplement?: string;
}

// Interface pour la réponse API générique
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

// Interface pour la réponse d'inscription
export interface RegistrationResponse {
  user: AuthenticatedUser;
  sessionCreated: boolean;
}

// Interface pour la réponse de connexion
export interface LoginResponse {
  user: AuthenticatedUser;
  sessionCreated: boolean;
}

// Interface pour la vérification d'email
export interface EmailCheckResponse {
  exists: boolean;
  message?: string;
}

// Interface pour la réponse de vérification d'auth
export interface AuthCheckResponse {
  isAuthenticated: boolean;
  user?: AuthenticatedUser;
}

// Types pour les erreurs de formulaire
export interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

// Interface pour l'état de soumission
export interface SubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}