import React from "react";
import MenuItem from "./MenuItem";
import { MenuItem as MenuItemType } from "@/types/dashboard.type";
import { useTheme } from "@/context/ThemeContext";

interface SidebarSectionProps {
  title: string;
  items: MenuItemType[];
  activeItem: string;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  isCollapsed?: boolean;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  items,
  activeItem,
  expandedSections,
  toggleSection,
  isCollapsed = false,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="mb-8">
      {!isCollapsed && (
        <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 px-6 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {title}
        </h3>
      )}
      <nav className="space-y-1">
        {items.map((item) => (
          <MenuItem
            key={item.name}
            item={item}
            activeItem={activeItem}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </div>
  );
};

export default SidebarSection;