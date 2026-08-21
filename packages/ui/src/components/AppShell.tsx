import React from 'react';
import { Topbar } from './Topbar';
import { Sidebar, NavItem } from './Sidebar';
import { Outlet } from 'react-router-dom';

interface AppShellProps {
  navItems: NavItem[];
  userRoles?: string[];
  userName?: string;
  onLogout?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ navItems, userRoles, userName, onLogout }) => {
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <Sidebar items={navItems} userRoles={userRoles} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar userName={userName} userRole={userRoles?.[0]} onLogout={onLogout} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* React Router will render the matched child route here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
