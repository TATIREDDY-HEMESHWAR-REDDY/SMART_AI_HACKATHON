import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';

interface TopbarProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ userName = 'Guest', userRole = '', onLogout }) => {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        {/* Mobile menu button could go here */}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <UserIcon size={20} />
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
