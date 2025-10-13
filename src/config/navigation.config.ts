import {
  Home,
  MessageSquare,
  Mail,
  Layout,
  Calendar,
  CheckSquare,
  Folder,
  Key,
  Wrench,
} from "lucide-react";
import { MenuItem } from "@/types/dashboard.type";

export const NAVIGATION_CONFIG: Record<string, MenuItem[]> = {
  MENU: [
    {
      name: "Dashboard",
      icon: Home,
      path: "/dashboard",
      hasSubmenu: true,
      submenu: [
        { name: "Gestion des categories", path: "/dashboard/categories" },
        { name: "Gestion des produits", path: "/dashboard/products" },
        { name: "Gestion des commandes", path: "/dashboard/orders" },
        { name: "Banking Dashboard", path: "/dashboard/banking" },
      ],
    },
  ],
};