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