import React, { useEffect, useState } from 'react';
import { User as UserIcon, Mail, BookOpen, Calendar, GraduationCap } from 'lucide-react';

export const Profile = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        
        let url = `http://localhost:3000/api/v1/users/${storedUser.id}`;
        if (storedUser.roles?.includes('STUDENT')) {
          url = `http://localhost:3000/api/v1/students/${storedUser.id}`;
        }

        const res = await fetch(url, { headers });
        const data = await res.json();
        
        if (data.success) {
          setUserProfile(data.data);
        }
      } catch (err) {
        console.error('Error fetching profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (!userProfile) return <div className="p-6">Profile data not found.</div>;

  const isStudent = !!userProfile.enrollmentNumber;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex items-center gap-6">
        <div className="h-24 w-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <UserIcon size={48} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isStudent ? `${userProfile.firstName} ${userProfile.lastName}` : userProfile.email}
          </h1>
          {isStudent && (
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <BookOpen size={16}/> Enrollment: {userProfile.enrollmentNumber}
            </p>
          )}
          {!isStudent && userProfile.roles && (
            <div className="flex gap-2 mt-2">
              {userProfile.roles.map((role: string) => (
                <span key={role} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{role}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Student Details */}
      {isStudent && userProfile.program && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Academic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Program</p>
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <GraduationCap size={16} className="text-blue-500" />
                {userProfile.program.name} ({userProfile.program.code})
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Department</p>
              <p className="font-medium text-gray-900">
                {userProfile.program.department?.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enrollments */}
      {isStudent && userProfile.enrollments && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Enrollments</h2>
          <div className="divide-y divide-gray-100">
            {userProfile.enrollments.map((e: any) => (
              <div key={e.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">{e.course.name}</p>
                  <p className="text-sm text-gray-500">{e.course.code} • {e.course.credits} Credits</p>
                </div>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                  Enrolled
                </span>
              </div>
            ))}
            {userProfile.enrollments.length === 0 && (
              <p className="text-gray-500 italic">No course enrollments found.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
