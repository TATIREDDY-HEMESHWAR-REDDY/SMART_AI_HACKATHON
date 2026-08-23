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
  Target,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';

const ERP_URL = import.meta.env.VITE_ERP_URL || 'http://localhost:3001';
import { useStudent } from '@/contexts/StudentContext';

const navigation = [
  { name: 'Dashboard', href: '/career', icon: LayoutDashboard },
  { name: 'Profile', href: '/career/profile', icon: User },
  { name: 'Aptitude', href: '/career/aptitude', icon: Target },
  { name: 'Technical', href: '/career/technical', icon: Code2 },
  { name: 'Communication', href: '/career/communication', icon: MessageSquare },
  { name: 'Coding', href: '/career/coding', icon: Code2 },
  { name: 'Resume', href: '/career/resume', icon: FileText },
  { name: 'Interview', href: '/career/interview', icon: Bot },
  { name: 'Jobs', href: '/career/jobs', icon: Briefcase },
  { name: 'Applications', href: '/career/applications', icon: FileText },
  { name: 'Roadmap', href: '/career/roadmap', icon: Map },
  { name: 'AI Coach', href: '/career/coach', icon: Bot },
  { name: 'Analytics', href: '/career/analytics', icon: Activity },
];

export default function MainLayout() {
  const { pathname } = useLocation();
  const { student, loading } = useStudent();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="flex items-center px-5 pt-6 pb-5 border-b border-border">
          <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center font-semibold text-sm shrink-0">
            H
          </div>
          <div className="ml-2.5 min-w-0">
            <p className="font-serif text-[13.5px] leading-tight font-semibold text-foreground truncate">
              Hayagriva Vidya Kendram
            </p>
            <p className="text-[10px] tracking-wider uppercase text-muted-foreground mt-0.5">
              Career Wing
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon
                  className={`mr-3 h-4 w-4 flex-shrink-0 ${
                    isActive ? 'text-accent-foreground' : 'text-muted-foreground'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <a
            href={ERP_URL}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/70 hover:bg-secondary hover:text-foreground rounded-md transition-colors w-full"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            Back to Hayagriva ERP
          </a>
          <div className="flex items-center px-3 pt-2">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-primary font-semibold text-sm">
              {student?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{loading ? 'Loading…' : student?.name}</p>
              <p className="text-xs text-muted-foreground">{student?.section ? `Section ${student.section}` : 'Student'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border flex items-center px-8">
          <h1 className="text-[15px] font-medium text-foreground">
            {navigation.find(n => n.href === pathname)?.name || 'Career Wing'}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
