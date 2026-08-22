import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Code2, 
  Briefcase, 
  FileText, 
  Map, 
  Bot, 
  Activity,
  Target
} from 'lucide-react';
import { useStudent } from '@/contexts/StudentContext';

const navigation = [
  { name: 'Dashboard', href: '/career', icon: LayoutDashboard },
  { name: 'Profile', href: '/career/profile', icon: User },
  { name: 'Assessments', href: '/career/assessments', icon: Target },
  { name: 'Coding', href: '/career/coding', icon: Code2 },
  { name: 'Resume', href: '/career/resume', icon: FileText },
  { name: 'Jobs', href: '/career/jobs', icon: Briefcase },
  { name: 'Roadmap', href: '/career/roadmap', icon: Map },
  { name: 'AI Coach', href: '/career/coach', icon: Bot },
  { name: 'Analytics', href: '/career/analytics', icon: Activity },
];

export default function MainLayout() {
  const { pathname } = useLocation();
  const { student, loading } = useStudent();

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Career OS
          </span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon 
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-blue-700' : 'text-gray-400'
                  }`} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {student?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{loading ? 'Loading...' : student?.name}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">
            {navigation.find(n => n.href === pathname)?.name || 'Career OS'}
          </h1>
        </header>
        
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
