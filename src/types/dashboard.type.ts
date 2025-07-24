import { LucideIcon } from "lucide-react";

export interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
  hasSubmenu?: boolean;
  submenu?: SubMenuItem[];
}

export interface SubMenuItem {
  name: string;
  path: string;
}

export type SectionName = "Dashboard" | "Authentication" | "Utility" | "Projects";
