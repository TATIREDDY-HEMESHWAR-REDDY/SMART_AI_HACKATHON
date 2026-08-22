import React, { useEffect, useState } from 'react';

export const Dashboard = () => {
  const [user, setUser] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
    fetchData(storedUser);
  }, []);

  const fetchData = async (currentUser: any) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const roles = currentUser.roles || [];
      const newStats: any = {};

      if (roles.includes('STUDENT')) {
        // Fetch CGPA and upcoming assessments
        const profileRes = await fetch('http://localhost:3000/api/v1/students/me', { headers });
        const profileData = await profileRes.json();
        if (profileData.success) {
          newStats.cgpa = profileData.data.cgpa;
        }

        // Fetch Attendance
        const attRes = await fetch(`http://localhost:3000/api/v1/attendance/student/${currentUser.id}`, { headers });
        const attData = await attRes.json();
        if (attData.success && attData.data.length > 0) {
          const totalSessions = attData.data.reduce((acc: number, curr: any) => acc + curr.totalSessions, 0);
          const totalPresent = attData.data.reduce((acc: number, curr: any) => acc + curr.presentCount, 0);
          newStats.attendance = totalSessions === 0 ? 100 : Math.round((totalPresent / totalSessions) * 100);
        } else {
          newStats.attendance = 'N/A';
        }
      }

      if (roles.includes('FACULTY')) {
        const courseRes = await fetch('http://localhost:3000/api/v1/academics/courses', { headers });
        const courseData = await courseRes.json();
        if (courseData.success) {
          newStats.totalClasses = courseData.data.length;
          // Rough mock for pending evaluations - count total students enrolled in their courses
          newStats.pendingEvaluations = courseData.data.reduce((acc: number, curr: any) => acc + (curr.enrollments?.length || 0), 0);
        }
      }

      if (roles.includes('COLLEGE_ADMIN')) {
        const instRes = await fetch('http://localhost:3000/api/v1/institutions/me', { headers });
        const instData = await instRes.json();
        if (instData.success) {
          newStats.totalStudents = instData.data._count?.users || 0; // Using users count for simplicity
          newStats.totalDepartments = instData.data._count?.departments || 0;
        }
      }

      if (roles.includes('TPO') || roles.includes('RECRUITER')) {
        const [drivesRes, companiesRes] = await Promise.all([
          fetch('http://localhost:3000/api/v1/placement/drives', { headers }),
          fetch('http://localhost:3000/api/v1/placement/companies', { headers })
        ]);
        const dData = await drivesRes.json();
        const cData = await companiesRes.json();
        
        if (dData.success) {
          newStats.activeDrives = dData.data.filter((d: any) => d.status === 'PUBLISHED').length;
        }
        if (cData.success) {
          newStats.registeredCompanies = cData.data.length;
        }
      }

      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  const roles = user.roles || [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Welcome back, {user.profile?.firstName || user.email || 'User'}!</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {roles.includes('STUDENT') && (
          <>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-sm">
              <h3 className="font-medium opacity-90">Current Semester CGPA</h3>
              <p className="text-3xl font-bold mt-2">{stats.cgpa?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-sm">
              <h3 className="font-medium opacity-90">Overall Attendance</h3>
              <p className="text-3xl font-bold mt-2">{stats.attendance}{stats.attendance !== 'N/A' && '%'}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-xl shadow-sm">
              <h3 className="font-medium opacity-90">Program Standing</h3>
              <p className="text-3xl font-bold mt-2">Active</p>
            </div>
          </>
        )}

        {roles.includes('FACULTY') && (
          <>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-sm">
              <h3 className="font-medium opacity-90">My Courses</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalClasses || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-xl shadow-sm">
              <h3 className="font-medium opacity-90">Total Enrolled Students</h3>
              <p className="text-3xl font-bold mt-2">{stats.pendingEvaluations || 0}</p>
            </div>
          </>
        )}

        {roles.includes('COLLEGE_ADMIN') && (
          <>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-sm">
              <h3 className="font-medium opacity-90">Total Campus Users</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalStudents || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-sm">
              <h3 className="font-medium opacity-90">Departments</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalDepartments || 0}</p>
            </div>
          </>
        )}

        {(roles.includes('TPO') || roles.includes('RECRUITER')) && (
          <>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-sm">
              <h3 className="font-medium opacity-90">Active Placement Drives</h3>
              <p className="text-3xl font-bold mt-2">{stats.activeDrives || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-sm">
              <h3 className="font-medium opacity-90">Registered Companies</h3>
              <p className="text-3xl font-bold mt-2">{stats.registeredCompanies || 0}</p>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
