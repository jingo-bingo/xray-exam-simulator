
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

export const SidebarNav = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  console.log("SidebarNav: Rendering with collapsed state:", collapsed);

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard
    },
    {
      name: "Cases Management",
      href: "/admin/cases",
      icon: FileText
    },
    {
      name: "Browse Cases",
      href: "/cases",
      icon: FileText,
      description: "View cases as a trainee would see them"
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings
    }
  ];

  return (
    <aside 
      className={cn(
        "bg-gray-900 transition-all duration-300 h-screen flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex justify-between items-center">
        {!collapsed && <h2 className="text-xl font-semibold text-white">RadExam</h2>}
        <button 
          onClick={() => {
            console.log(`SidebarNav: Toggling sidebar to ${!collapsed ? 'collapsed' : 'expanded'} state`);
            setCollapsed(!collapsed);
          }}
          className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 mt-6">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink 
                to={item.href}
                className={({ isActive }) => cn(
                  "flex items-center p-3 rounded-md transition-colors",
                  isActive 
                    ? "bg-gray-800 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800",
                  collapsed ? "justify-center" : "justify-start"
                )}
                onClick={() => console.log(`SidebarNav: Navigating to ${item.href}`)}
                title={collapsed ? item.name : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
