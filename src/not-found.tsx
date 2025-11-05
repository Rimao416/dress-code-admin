"use client"
import { useTheme } from "@/context/ThemeContext";
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-stone-50 to-stone-100'
    }`}>
      {/* Bouton Dark Mode */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 p-2 rounded-lg transition-colors z-50 ${
          isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-white text-gray-700 shadow-md'
        }`}
      >
        {isDarkMode ? '🌞' : '🌙'}
      </button>

      {/* Contenu principal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className={`w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}>
          <div className="grid md:grid-cols-2 gap-0">
            {/* Section gauche - Illustration */}
            <div className={`p-8 lg:p-12 flex flex-col justify-center items-center relative overflow-hidden ${
              isDarkMode 
                ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
                : 'bg-gradient-to-br from-stone-50 to-stone-100'
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-800/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-neutral-900/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 text-center space-y-8">
                {/* Logo 404 stylisé */}
                <div className="relative">
                  <div className={`text-[12rem] font-black leading-none ${
                    isDarkMode ? 'text-slate-700/50' : 'text-stone-200'
                  }`}>
                    404
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-red-800 to-red-700 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                      <AlertTriangle className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>

                {/* Icônes décoratives */}
                <div className="flex justify-center gap-4">
                  {[Search, Home, ArrowLeft].map((Icon, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 rounded-xl ${
                        isDarkMode ? 'bg-slate-700/50' : 'bg-white/80'
                      } backdrop-blur-sm border ${
                        isDarkMode ? 'border-slate-600' : 'border-stone-200'
                      } flex items-center justify-center transform hover:scale-110 transition-transform`}
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <Icon className={`w-6 h-6 ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section droite - Message et actions */}
            <div className={`p-8 lg:p-12 flex flex-col justify-center ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="max-w-md mx-auto w-full space-y-8">
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-px bg-red-800"></div>
                    <h3 className="text-lg font-medium tracking-widest text-red-800 uppercase">
                      Erreur 404
                    </h3>
                  </div>
                  
                  <h1 className={`text-4xl lg:text-5xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Page introuvable
                  </h1>
                  
                  <p className={`text-lg ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-600'
                  }`}>
                    Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                  </p>
                </div>

                {/* Suggestions */}
                <div className={`p-6 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-slate-700/30 border-slate-600' 
                    : 'bg-stone-50 border-stone-200'
                }`}>
                  <h3 className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-slate-200' : 'text-gray-900'
                  }`}>
                    Suggestions :
                  </h3>
                  <ul className="space-y-2">
                    {[
                      'Vérifiez l\'URL pour les fautes de frappe',
                      'Retournez à la page précédente',
                      'Visitez notre page d\'accueil'
                    ].map((suggestion, index) => (
                      <li
                        key={index}
                        className={`flex items-start gap-2 text-sm ${
                          isDarkMode ? 'text-slate-300' : 'text-gray-600'
                        }`}
                      >
                        <span className="text-red-800 font-bold mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    onClick={handleGoHome}
                    className="w-full"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Retour à l'accueil
                  </Button>

                  <button
                    onClick={handleGoBack}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg border transition-all ${
                      isDarkMode
                        ? 'border-slate-600 text-slate-200 hover:bg-slate-700'
                        : 'border-stone-300 text-gray-700 hover:bg-stone-50'
                    }`}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Page précédente
                  </button>
                </div>

                {/* Info supplémentaire */}
                <div className={`text-center text-sm ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  <p>
                    Besoin d'aide ?{' '}
                    <a
                      href="/contact"
                      className="text-red-800 hover:text-red-700 font-medium underline underline-offset-2"
                    >
                      Contactez-nous
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}