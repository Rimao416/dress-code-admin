"use client"
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import FormField from "@/components/ui/formfield";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function LoginPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<any>({});
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide";
    }
    
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Connexion réussie ! Redirection...'
        });
        
        setTimeout(() => {
          window.location.href = '/dashboard/products';
        }, 1500);
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Erreur lors de la connexion'
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Erreur de connexion au serveur'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-stone-50 to-stone-100'
    }`}>
      {/* Bouton Dark Mode */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 p-2 rounded-lg transition-colors ${
          isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-white text-gray-700 shadow-md'
        }`}
      >
        {isDarkMode ? '🌞' : '🌙'}
      </button>

      {/* Contenu principal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className={`w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}>
          <div className="grid md:grid-cols-2 gap-0">
            {/* Section gauche */}
            <div className={`p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden ${
              isDarkMode 
                ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
                : 'bg-gradient-to-br from-stone-50 to-stone-100'
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-800/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-neutral-900/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-800 to-red-700 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                    <span className="text-4xl font-bold text-white">DC</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-px bg-red-800"></div>
                    <h3 className="text-xl font-medium tracking-widest text-red-800 uppercase">
                      Connexion
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className={`text-3xl lg:text-4xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Bon retour chez DressCode
                  </h1>
                  <p className={`text-lg ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-600'
                  }`}>
                    Connectez-vous pour accéder à vos commandes, vos favoris et profiter d&apos;une expérience personnalisée.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    'Accès sécurisé à votre compte',
                    'Suivi de vos commandes en temps réel',
                    'Gestion de vos favoris'
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isDarkMode ? 'bg-slate-700/50' : 'bg-white/80'
                      } backdrop-blur-sm border ${
                        isDarkMode ? 'border-slate-600' : 'border-stone-200'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-800 to-red-700 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-slate-200' : 'text-gray-700'
                      }`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section droite - Formulaire */}
            <div className={`p-8 lg:p-12 flex flex-col justify-center ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="max-w-md mx-auto w-full space-y-6">
                <div className="space-y-2">
                  <h2 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Se connecter
                  </h2>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Entrez vos identifiants pour continuer
                  </p>
                </div>

                {submitStatus.type && (
                  <div className={`flex items-center gap-2 p-4 rounded-lg border ${
                    submitStatus.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                      : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                  }`}>
                    {submitStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">{submitStatus.message}</span>
                  </div>
                )}

                <div className="space-y-5">
                  <FormField
                    label="Adresse e-mail"
                    error={errors.email}
                    required
                  >
                    <Input
                      type="email"
                      placeholder="votre.email@exemple.com"
                      disabled={isSubmitting}
                      error={errors.email}
                      value={formData.email}
                      onChange={(e: any) => handleInputChange('email', e.target.value)}
                    />
                  </FormField>

                  <FormField
                    label="Mot de passe"
                    error={errors.password}
                    required
                  >
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        error={errors.password}
                        value={formData.password}
                        onChange={(e: any) => handleInputChange('password', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                          isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </FormField>

                  <Button
                    variant="primary"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}