"use client";
import React from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MenuItem as MenuItemType } from "@/types/dashboard.type";
import { useTheme } from "@/context/ThemeContext";

interface MenuItemProps {
  item: MenuItemType;
  activeItem: string;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  isCollapsed?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  activeItem,
  expandedSections,
  toggleSection,
  isCollapsed = false,
}) => {
  const { isDarkMode } = useTheme();
  
  const isActive = activeItem === item.path ||
    (item.submenu && item.submenu.some(sub => activeItem === sub.path));
  const isExpanded = expandedSections[item.name] || false; // Ajout de || false

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (item.hasSubmenu) {
      toggleSection(item.name);
    }
  };

  // Classes dynamiques pour le thème
  const getButtonClasses = (isActiveItem: boolean) => {
    const baseClasses = "w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ease-in-out group";
    
    if (isActiveItem) {
      return `${baseClasses} ${
        isDarkMode 
          ? "bg-blue-900/50 text-blue-300 border-r-2 border-blue-400" 
          : "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
      }`;
    }
    
    return `${baseClasses} ${
      isDarkMode 
        ? "text-gray-300 hover:bg-gray-700 hover:text-white" 
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    }`;
  };

  const getIconClasses = (isActiveItem: boolean) => {
    const baseClasses = "mr-3 h-5 w-5 transition-colors duration-200";
    
    if (isActiveItem) {
      return `${baseClasses} ${
        isDarkMode ? "text-blue-300" : "text-blue-700"
      }`;
    }
    
    return `${baseClasses} ${
      isDarkMode 
        ? "text-gray-400 group-hover:text-gray-200" 
        : "text-gray-500 group-hover:text-gray-700"
    }`;
  };

  const getSubmenuClasses = (isActiveSubItem: boolean) => {
    const baseClasses = "w-full flex items-center px-4 py-2 text-sm rounded-lg mx-2 transition-all duration-200 ease-in-out";
    
    if (isActiveSubItem) {
      return `${baseClasses} ${
        isDarkMode 
          ? "bg-blue-900/30 text-blue-200 font-medium" 
          : "bg-blue-50 text-blue-700 font-medium"
      }`;
    }
    
    return `${baseClasses} ${
      isDarkMode 
        ? "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200" 
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;
  };

  // Si l'item a un sous-menu, on utilise un button pour le toggle
  if (item.hasSubmenu) {
    return (
      <div>
        <button
          onClick={handleToggle}
          className={getButtonClasses(Boolean(isActive))} // Utilisation de Boolean()
        >
          <item.icon className={getIconClasses(Boolean(isActive))} /> {/* Utilisation de Boolean() */}
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.name}</span>
              <div className="ml-auto">
                {isExpanded ? (
                  <ChevronDown className={`h-4 w-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                ) : (
                  <ChevronRight className={`h-4 w-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                )}
              </div>
            </>
          )}
        </button>
        
        {/* Sous-menu */}
        {item.hasSubmenu && isExpanded && item.submenu && !isCollapsed && (
          <div className="ml-6 mt-1 space-y-1">
            {item.submenu.map((subItem) => (
              <Link
                key={subItem.path}
                href={subItem.path}
                className={getSubmenuClasses(activeItem === subItem.path)}
              >
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  isDarkMode ? 'bg-gray-500' : 'bg-gray-300'
                }`} />
                {subItem.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Si l'item n'a pas de sous-menu, on utilise Link directement
  return (
    <div>
      <Link
        href={item.path}
        className={getButtonClasses(Boolean(isActive))} // Utilisation de Boolean()
      >
        <item.icon className={getIconClasses(Boolean(isActive))} /> {/* Utilisation de Boolean() */}
        {!isCollapsed && (
          <span className="flex-1 text-left">{item.name}</span>
        )}
      </Link>
    </div>
  );
};

export default MenuItem;