import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: string[]; // If omitted, visible to all
}

interface SidebarProps {
  items: NavItem[];
  userRoles?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ items, userRoles = [] }) => {
  // Filter items based on user roles
  const visibleItems = items.filter(
    (item) => !item.roles || item.roles.some((role) => userRoles.includes(role))
  );

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full">
      <div className="h-16 flex items-center px-6 font-bold text-xl text-white border-b border-slate-800">
        Campus OS
      </div>
      
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        &copy; 2026 Campus OS
      </div>
    </aside>
  );
};
