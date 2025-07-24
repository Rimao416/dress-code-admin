"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cubicBezier } from "framer-motion";
import {
  Search,
  Bell,
  Settings,
  User,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import SidebarContainer from "@/components/sidebar/SidebarContainer";
import SidebarSection from "@/components/sidebar/SidebarSection";
import { NAVIGATION_CONFIG } from "@/config/navigation.config";
import { useNavigation } from "@/hooks/useNavigation";
import { useTheme } from "@/context/ThemeContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { activeItem, expandedSections, toggleSection } = useNavigation();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  };

const searchVariants = {
  initial: { width: "300px" },
  focus: {
    width: "400px",
    transition: {
      duration: 0.3,
      ease: cubicBezier(0.25, 0.46, 0.45, 0.94)
    }
  }
};
  const notificationVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50'}`}>
      <SidebarContainer
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      >
        {Object.entries(NAVIGATION_CONFIG).map(([sectionKey, items]) => (
          <SidebarSection
            key={sectionKey}
            title={sectionKey}
            items={items}
            activeItem={activeItem}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            isCollapsed={isCollapsed}
          />
        ))}
      </SidebarContainer>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className={`${
            isDarkMode
              ? 'bg-gray-800/80 border-gray-700'
              : 'bg-white/80 border-gray-200'
          } backdrop-blur-xl border-b px-6 py-4 shadow-sm`}
        >
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCollapse}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <motion.div
                  animate={{ rotate: isCollapsed ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isCollapsed ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </motion.button>
            </div>

            {/* Center Section - Search */}
            <motion.div
              variants={searchVariants}
              initial="initial"
              whileFocus="focus"
              className="relative"
            >
              <div className="relative">
                <Search
                  size={20}
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="Rechercher..."
                  className={`pl-10 pr-4 py-2 w-full rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </motion.div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <motion.button
                variants={notificationVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-yellow-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <motion.div
                  animate={{ rotate: isDarkMode ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </motion.div>
              </motion.button>

              {/* Notifications */}
              <motion.button
                variants={notificationVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className={`relative p-2 rounded-full transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Bell size={20} />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
                />
              </motion.button>

              {/* Settings */}
              <motion.button
                variants={notificationVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Settings size={20} />
                </motion.div>
              </motion.button>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-2 p-2 rounded-full transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <motion.div
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                  </motion.div>
                </motion.button>

                {/* User Dropdown */}
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{
                    opacity: showUserMenu ? 1 : 0,
                    y: showUserMenu ? 0 : -10,
                    scale: showUserMenu ? 1 : 0.95
                  }}
                  transition={{ duration: 0.2 }}
                  className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } border ${showUserMenu ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                  <div className="py-2">
                    <a href="#" className={`block px-4 py-2 text-sm transition-colors ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      Mon Profil
                    </a>
                    <a href="#" className={`block px-4 py-2 text-sm transition-colors ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      Paramètres
                    </a>
                    <hr className={`my-1 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                    <a href="#" className={`block px-4 py-2 text-sm transition-colors ${
                      isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'
                    }`}>
                      Déconnexion
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Content Area with Beautiful Padding and Styling */}
        <div className="flex-1 overflow-hidden p-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`h-full shadow-xl ${
              isDarkMode
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white/70 border-gray-200'
            } border backdrop-blur-sm overflow-hidden`}
          >
            <div className="h-full overflow-y-auto p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;