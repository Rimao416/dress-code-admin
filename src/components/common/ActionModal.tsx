import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemCount?: number;
  isProcessing?: boolean;
  actionType: 'delete' | 'disable' | 'activate';
}

export default function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemCount = 1,
  isProcessing = false,
  actionType = 'delete'
}: ActionModalProps) {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  // Configuration basée sur le type d'action avec support du dark mode
  const configs = {
    delete: {
      title: "Confirmer la suppression",
      actionText: "Supprimer",
      processingText: "Suppression en cours...",
      buttonColor: "bg-red-600 border-red-600 hover:bg-red-700 dark:bg-red-500 dark:border-red-500 dark:hover:bg-red-600",
      iconColor: "text-red-500 dark:text-red-400",
      iconBgColor: "bg-red-100 dark:bg-red-900/30",
      icon: X,
      getConfirmText: (count: number, name: string) => count > 1
        ? `Êtes-vous sûr de vouloir supprimer ces ${count} ${name}s ?`
        : `Êtes-vous sûr de vouloir supprimer ce ${name} ?`,
      warningText: "Cette action est irréversible. Toutes les données associées seront définitivement supprimées."
    },
    disable: {
      title: "Confirmer la désactivation",
      actionText: "Désactiver",
      processingText: "Désactivation en cours...",
      buttonColor: "bg-amber-600 border-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:border-amber-500 dark:hover:bg-amber-600",
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBgColor: "bg-amber-100 dark:bg-amber-900/30",
      icon: X,
      getConfirmText: (count: number, name: string) => count > 1
        ? `Êtes-vous sûr de vouloir désactiver ces ${count} ${name}s ?`
        : `Êtes-vous sûr de vouloir désactiver ce ${name} ?`,
      warningText: "Cette action peut être annulée ultérieurement. Les éléments désactivés ne seront plus accessibles aux utilisateurs."
    },
    activate: {
      title: "Confirmer l'activation",
      actionText: "Activer",
      processingText: "Activation en cours...",
      buttonColor: "bg-green-600 border-green-600 hover:bg-green-700 dark:bg-green-500 dark:border-green-500 dark:hover:bg-green-600",
      iconColor: "text-green-500 dark:text-green-400",
      iconBgColor: "bg-green-100 dark:bg-green-900/30",
      icon: Check,
      getConfirmText: (count: number, name: string) => count > 1
        ? `Êtes-vous sûr de vouloir activer ces ${count} ${name}s ?`
        : `Êtes-vous sûr de vouloir activer ce ${name} ?`,
      warningText: "Cela rendra l'élément à nouveau accessible aux utilisateurs."
    }
  };

  const config = configs[actionType];
  const confirmText = config.getConfirmText(itemCount, itemName);
  const Icon = config.icon;

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDarkMode 
          ? 'bg-black/50' 
          : 'bg-black/30'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`w-full max-w-md mx-4 overflow-hidden rounded-lg shadow-xl ${
          isDarkMode
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white'
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className={`text-lg font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {config.title}
            </h2>
            <button
              onClick={onClose}
              className={`transition-colors ${
                isDarkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
              disabled={isProcessing}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center mb-6">
            <div className={`${config.iconBgColor} p-3 rounded-full mb-4`}>
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <p className={`text-center font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {confirmText}
            </p>
            <p className={`text-center text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {config.warningText}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isDarkMode
                  ? 'border border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              disabled={isProcessing}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${config.buttonColor}`}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {config.processingText}
                </div>
              ) : config.actionText}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}