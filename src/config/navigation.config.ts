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
        { name: "Gestion des sous-categories", path: "/dashboard/sub-categories" },
        { name: "Project Dashboard", path: "/dashboard/projects" },
        { name: "CRM Dashboard", path: "/dashboard/crm" },
        { name: "Banking Dashboard", path: "/dashboard/banking" },
      ],
    },
  ],
  APPS: [
    { name: "Chat", icon: MessageSquare, path: "/apps/chat" },
    { name: "Email", icon: Mail, path: "/apps/email" },
    { name: "Kanban", icon: Layout, path: "/apps/kanban" },
    { name: "Calendar", icon: Calendar, path: "/apps/calendar" },
    { name: "Todo", icon: CheckSquare, path: "/apps/todo" },
    {
      name: "Projects",
      icon: Folder,
      path: "/apps/projects",
      hasSubmenu: true,
      submenu: [
        { name: "Project List", path: "/apps/projects/list" },
        { name: "Project Details", path: "/apps/projects/details" },
        { name: "Create Project", path: "/apps/projects/create" },
      ],
    },
  ],
  PAGES: [
    {
      name: "Authentication",
      icon: Key,
      path: "/auth",
      hasSubmenu: true,
      submenu: [
        { name: "Sign In", path: "/auth/signin" },
        { name: "Sign Up", path: "/auth/signup" },
        { name: "Forgot Password", path: "/auth/forgot-password" },
        { name: "Reset Password", path: "/auth/reset-password" },
      ],
    },
    {
      name: "Utility",
      icon: Wrench,
      path: "/utility",
      hasSubmenu: true,
      submenu: [
        { name: "Settings", path: "/utility/settings" },
        { name: "Profile", path: "/utility/profile" },
        { name: "Notifications", path: "/utility/notifications" },
        { name: "Help Center", path: "/utility/help" },
      ],
    },
  ],
};