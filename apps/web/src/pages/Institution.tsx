import React, { useEffect, useState } from 'react';
import { Building2, GraduationCap, Users, BookOpen } from 'lucide-react';

export const Institution = () => {
  const [institution, setInstitution] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        
        const [instRes, deptRes] = await Promise.all([
          fetch('http://localhost:3000/api/v1/institutions/me', { headers }),
          fetch('http://localhost:3000/api/v1/institutions/departments', { headers })
        ]);

        const instData = await instRes.json();
        const deptData = await deptRes.json();

        if (instData.success) setInstitution(instData.data);
        if (deptData.success) setDepartments(deptData.data);
      } catch (err) {
        console.error('Error fetching institution data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading institution structure...</div>;
  if (!institution) return <div className="p-6">Institution data not available.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="h-24 w-24 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
          <Building2 size={48} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{institution.name}</h1>
          <p className="text-gray-500 mt-1">Institution Code: {institution.code}</p>
          <div className="flex gap-4 mt-4">
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              <Users size={16} />
              {institution._count?.users || 0} Total Users
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              <BookOpen size={16} />
              {institution._count?.departments || 0} Departments
            </span>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Academic Departments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{dept.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Code: {dept.code}</p>
              
              <div className="flex-grow">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Programs</h4>
                <ul className="space-y-2">
                  {dept.programs.map((prog: any) => (
                    <li key={prog.id} className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      <GraduationCap size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      <span>{prog.name} ({prog.code})</span>
                    </li>
                  ))}
                  {dept.programs.length === 0 && (
                    <li className="text-sm text-gray-400 italic">No programs defined</li>
                  )}
                </ul>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="text-gray-500">Active Courses</span>
                <span className="font-bold text-gray-900">{dept._count?.courses || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
