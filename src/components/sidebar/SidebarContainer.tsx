"use client";
import React from "react";
import { useTheme } from "@/context/ThemeContext";

interface SidebarContainerProps {
  children: React.ReactNode;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SidebarContainer: React.FC<SidebarContainerProps> = ({
  children,
  isCollapsed = false,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`
      ${isCollapsed ? 'w-20' : 'w-64'}
      ${isDarkMode 
        ? 'bg-gray-800 shadow-lg border-r border-gray-700' 
        : 'bg-white shadow-lg border-r border-gray-200'
      }
      flex flex-col transition-all duration-300 ease-in-out
    `}>
      {/* Header */}
      <div className={`flex items-center px-6 py-5 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">DC</span>
          </div>
          {!isCollapsed && (
            <span className={`ml-3 text-lg font-semibold truncate ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Dress Code
            </span>
          )}
        </div>
    
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-6">
        {children}
      </div>

      {/* Footer */}
      <div className={`px-6 py-4 border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <span className={`text-xs font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>JD</span>
          </div>
          {!isCollapsed && (
            <div className="ml-3 min-w-0">
              <p className={`text-sm font-medium truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>John Doe</p>
              <p className={`text-xs truncate ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>john@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarContainer;