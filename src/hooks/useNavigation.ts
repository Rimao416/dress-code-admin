"use client";
import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

export const useNavigation = () => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(pathname);
  
  // Correction : utiliser les vraies clés de NAVIGATION_CONFIG
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Dashboard: true, // Nom de l'item, pas de la section
    Projects: false,
    Authentication: false,
    Utility: false,
  });

  // Met à jour l'élément actif quand l'URL change
  useEffect(() => {
    setActiveItem(pathname);
  }, [pathname]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  return {
    activeItem,
    expandedSections,
    toggleSection,
  };
};