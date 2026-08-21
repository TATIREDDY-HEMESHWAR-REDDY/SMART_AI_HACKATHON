import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell, RoleGuard, NavItem } from '@campus-os/ui';
import { BookOpen, Calendar, GraduationCap, FileText, Briefcase, ShieldAlert, BadgeCheck, Compass, ListPlus, Brain } from 'lucide-react';
import { CareerProfile } from './features/career/CareerProfile';
import { SkillCatalog } from './features/career/SkillCatalog';
import { CareerAssessment } from './features/career/CareerAssessment';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: BookOpen },
  { label: 'Attendance', href: '/attendance', icon: Calendar, roles: ['STUDENT', 'FACULTY', 'PARENT'] },
  { label: 'Academics', href: '/academics', icon: GraduationCap, roles: ['STUDENT', 'FACULTY'] },
  { label: 'Career Profile', href: '/career', icon: Compass, roles: ['STUDENT'] },
  { label: 'Skill Catalog', href: '/skills', icon: ListPlus, roles: ['STUDENT'] },
  { label: 'Assessments', href: '/assessments', icon: Brain, roles: ['STUDENT'] },
  { label: 'Placement', href: '/placement', icon: Briefcase, roles: ['STUDENT', 'TPO', 'RECRUITER'] },
  { label: 'Credentials', href: '/credentials', icon: BadgeCheck },
  { label: 'Safety SOS', href: '/safety', icon: ShieldAlert },
];

export const App = () => {
  // Mock current user state for Stage 0 demo
  const mockUser = {
    name: 'Ananya Sharma',
    roles: ['STUDENT']
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected App Routes */}
        <Route 
          element={
            <AppShell 
              navItems={navItems} 
              userRoles={mockUser.roles} 
              userName={mockUser.name}
              onLogout={() => alert('Logout clicked')}
            />
          }
        >
          <Route path="/dashboard" element={
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 font-medium">Current CGPA</h3>
                  <p className="text-3xl font-bold mt-2">8.6</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 font-medium">Attendance</h3>
                  <p className="text-3xl font-bold mt-2">92%</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 font-medium">Career Readiness</h3>
                  <p className="text-3xl font-bold mt-2 text-green-600">High</p>
                </div>
              </div>
            </div>
          } />
          
          <Route path="/placement" element={
            <RoleGuard allowedRoles={['STUDENT', 'TPO', 'RECRUITER']} userRoles={mockUser.roles}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Placement Portal</h2>
                <p>Welcome to the placement drive portal.</p>
              </div>
            </RoleGuard>
          } />

          <Route path="/career" element={<CareerProfile />} />
          <Route path="/skills" element={<SkillCatalog />} />
          <Route path="/assessments" element={<CareerAssessment />} />

          {/* Add more placeholder routes as needed */}
          <Route path="*" element={<div className="p-6 text-gray-500">Feature coming soon...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
