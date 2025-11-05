// services/auth.service.ts
import { 
  ApiResponse, 
  RegistrationResponse, 
  LoginResponse, 
  EmailCheckResponse,
  AuthenticatedUser 
} from '@/types/auth.type';

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  private baseUrl = '/api/auth';

  // ✅ Service d'inscription corrigé
  async register(data: RegistrationData): Promise<ApiResponse<RegistrationResponse>> {
    try {
      console.log('🔄 Registration request:', { ...data, password: '[HIDDEN]' });
      
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ Important pour les cookies
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('📥 Registration response:', result);

      if (response.ok) {
        // ✅ Structure de réponse correcte selon ton API
        return {
          success: true,
          message: result.message,
          data: {
            user: result.user,
            sessionCreated: result.sessionCreated || true
          }
        };
      } else {
        // ✅ Gestion des erreurs de validation
        if (result.details && Array.isArray(result.details)) {
          const errors: Record<string, string> = {};
          result.details.forEach((detail: any) => {
            if (detail.path && detail.path.length > 0) {
              errors[detail.path[0]] = detail.message;
            }
          });
          
          return {
            success: false,
            message: result.error || 'Erreur de validation',
            errors
          };
        }

        return {
          success: false,
          message: result.error || 'Erreur lors de l\'inscription'
        };
      }
    } catch (error) {
      console.error('❌ Registration service error:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  // ✅ Service de connexion
  async login(data: LoginData): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log('🔄 Login request for:', data.email);
      
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('📥 Login response:', result);

      if (response.ok) {
        return {
          success: true,
          message: result.message,
          data: {
            user: result.user,
            sessionCreated: result.sessionCreated || true
          }
        };
      } else {
        return {
          success: false,
          message: result.error || 'Erreur lors de la connexion'
        };
      }
    } catch (error) {
      console.error('❌ Login service error:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  // ✅ Vérification du statut d'authentification
  async checkAuthStatus(): Promise<AuthenticatedUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      if (response.ok) {
        const user = await response.json();
        console.log('✅ Auth status check successful:', user);
        return user;
      } else {
        console.log('❌ Auth status check failed:', response.status);
        return null;
      }
    } catch (error) {
      console.error('❌ Auth status check error:', error);
      return null;
    }
  }

  // ✅ Vérification si un email existe
  async checkEmailExists(email: string): Promise<EmailCheckResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      return {
        exists: result.exists || false,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Email check error:', error);
      return {
        exists: false,
        message: 'Erreur lors de la vérification'
      };
    }
  }

  // ✅ Déconnexion
  async logout(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Déconnexion réussie'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Erreur lors de la déconnexion'
        };
      }
    } catch (error) {
      console.error('❌ Logout service error:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }
}

export const authService = new AuthService();