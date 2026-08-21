import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppShell, RoleGuard, NavItem } from '@campus-os/ui';
import { BookOpen, Calendar, GraduationCap, FileText, Briefcase, ShieldAlert, BadgeCheck, Building2, Bell } from 'lucide-react';
import { Login } from './pages/Login';
import { Attendance } from './pages/Attendance';
import { Institution } from './pages/Institution';
import { Profile } from './pages/Profile';
import { Academics } from './pages/Academics';
import { Helpdesk } from './pages/Helpdesk';
import { NotificationsManage } from './pages/NotificationsManage';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: BookOpen },
  { label: 'Institution', href: '/institution', icon: Building2, roles: ['COLLEGE_ADMIN', 'SUPER_ADMIN', 'FACULTY'] },
  { label: 'Attendance', href: '/attendance', icon: Calendar, roles: ['STUDENT', 'FACULTY', 'PARENT'] },
  { label: 'Academics', href: '/academics', icon: GraduationCap, roles: ['STUDENT', 'FACULTY'] },
  { label: 'Helpdesk', href: '/helpdesk', icon: FileText },
  { label: 'Broadcast', href: '/notifications/manage', icon: Bell, roles: ['COLLEGE_ADMIN', 'ADMIN'] },
  { label: 'Placement', href: '/placement', icon: Briefcase, roles: ['STUDENT', 'TPO', 'RECRUITER'] },
  { label: 'Credentials', href: '/credentials', icon: BadgeCheck },
  { label: 'Safety SOS', href: '/safety', icon: ShieldAlert },
];

// A wrapper to protect routes and inject the current user into the AppShell
const ProtectedLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/v1/auth/logout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
      });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <AppShell 
      navItems={navItems} 
      userRoles={user.roles} 
      userName={user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
      onLogout={handleLogout}
    />
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected App Routes using the Layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 font-medium">Quick Stats</h3>
                  <p className="text-3xl font-bold mt-2">Active</p>
                </div>
              </div>
            </div>
          } />
          
          <Route path="/institution" element={
            <RoleGuard allowedRoles={['COLLEGE_ADMIN', 'SUPER_ADMIN', 'FACULTY']} userRoles={JSON.parse(localStorage.getItem('user') || '{}').roles || []}>
              <Institution />
            </RoleGuard>
          } />

          <Route path="/profile" element={<Profile />} />

          <Route path="/attendance" element={<Attendance />} />
          
          <Route path="/academics" element={
            <RoleGuard allowedRoles={['STUDENT', 'FACULTY']} userRoles={JSON.parse(localStorage.getItem('user') || '{}').roles || []}>
              <Academics />
            </RoleGuard>
          } />

          <Route path="/helpdesk" element={
            <RoleGuard allowedRoles={['STUDENT', 'FACULTY', 'COLLEGE_ADMIN', 'ADMIN', 'MAINTENANCE']} userRoles={JSON.parse(localStorage.getItem('user') || '{}').roles || []}>
              <Helpdesk />
            </RoleGuard>
          } />

          <Route path="/notifications/manage" element={
            <RoleGuard allowedRoles={['COLLEGE_ADMIN', 'ADMIN']} userRoles={JSON.parse(localStorage.getItem('user') || '{}').roles || []}>
              <NotificationsManage />
            </RoleGuard>
          } />
          
          <Route path="/placement" element={
            <RoleGuard allowedRoles={['STUDENT', 'TPO', 'RECRUITER']} userRoles={['STUDENT']}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Placement Portal</h2>
                <p>Welcome to the placement drive portal.</p>
              </div>
            </RoleGuard>
          } />

          <Route path="*" element={<div className="p-6 text-gray-500">Feature coming soon...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
