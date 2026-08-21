import React, { useEffect, useState } from 'react';
import { User as UserIcon, BookOpen, GraduationCap, Phone, Target, Award, Code, Briefcase, Edit2, Save, X } from 'lucide-react';

export const Profile = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      
      let url = `http://localhost:3000/api/v1/users/${storedUser.id}`;
      if (storedUser.roles?.includes('STUDENT')) {
        url = `http://localhost:3000/api/v1/students/me`;
      }

      const res = await fetch(url, { headers });
      const data = await res.json();
      
      if (data.success) {
        setUserProfile(data.data);
        setEditForm({
          phone: data.data.phone || '',
          careerGoal: data.data.careerGoal || '',
          skills: data.data.skills?.join(', ') || '',
          certifications: data.data.certifications?.join(', ') || '',
          projects: data.data.projects?.join(', ') || '',
          internships: data.data.internships?.join(', ') || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        phone: editForm.phone,
        careerGoal: editForm.careerGoal,
        skills: (editForm.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        certifications: (editForm.certifications || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        projects: (editForm.projects || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        internships: (editForm.internships || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      };

      const res = await fetch('http://localhost:3000/api/v1/students/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        await fetchProfile();
        setIsEditing(false);
      } else {
        const errData = await res.json().catch(() => null);
        alert(`Failed to save: ${errData?.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to update', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (!userProfile) return <div className="p-6">Profile data not found.</div>;

  const isStudent = !!userProfile.enrollmentNumber;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 overflow-hidden border-2 border-white shadow-sm">
            {userProfile.profilePhotoUrl ? (
              <img src={userProfile.profilePhotoUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <UserIcon size={48} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isStudent ? `${userProfile.firstName} ${userProfile.lastName}` : userProfile.email}
            </h1>
            {isStudent && (
              <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm font-medium">
                {userProfile.user?.email || 'student@hvk.edu'}
              </p>
            )}
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

        {isStudent && (
          <button 
            onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isEditing ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            {isEditing ? <><X size={16} /> Cancel</> : <><Edit2 size={16} /> Edit Profile</>}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Academic & Core Details */}
        <div className="lg:col-span-1 space-y-6">
          {isStudent && userProfile.program && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Academic Record</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Program</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <GraduationCap size={16} className="text-blue-500" /> {userProfile.program.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Department</p>
                  <p className="font-medium text-gray-900">{userProfile.program.department?.name}</p>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3 mt-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Semester</p>
                    <p className="font-bold text-gray-900">{userProfile.currentSemester}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">CGPA</p>
                    <p className="font-bold text-blue-600">{userProfile.cgpa?.toFixed(2) ?? 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isStudent && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Phone size={18} className="text-gray-400"/> Contact Info
              </h2>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editForm.phone} 
                  onChange={e => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+91 98765 43210"
                />
              ) : (
                <p className="text-gray-900">{userProfile.phone || <span className="text-gray-400 italic">Not provided</span>}</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Career Readiness Details */}
        <div className="lg:col-span-2 space-y-6">
          {isStudent && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Career Profile</h2>
                {isEditing && (
                  <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-70"
                  >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
              
              <div className="space-y-6">
                {/* Goal */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Target size={16} className="text-purple-500"/> Career Goal
                  </p>
                  {isEditing ? (
                    <input type="text" value={editForm.careerGoal} onChange={e => setEditForm({...editForm, careerGoal: e.target.value})} className="w-full text-sm border-gray-300 rounded-md" placeholder="e.g. Software Engineer in AI/ML" />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{userProfile.careerGoal || 'Not specified'}</p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Code size={16} className="text-blue-500"/> Skills
                  </p>
                  {isEditing ? (
                    <textarea value={editForm.skills} onChange={e => setEditForm({...editForm, skills: e.target.value})} className="w-full text-sm border-gray-300 rounded-md" placeholder="Comma separated (e.g. React, Node, Python)" rows={2} />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userProfile.skills?.length > 0 ? userProfile.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{skill}</span>
                      )) : <span className="text-gray-400 italic text-sm">No skills added</span>}
                    </div>
                  )}
                </div>

                {/* Projects */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase size={16} className="text-orange-500"/> Projects
                  </p>
                  {isEditing ? (
                    <textarea value={editForm.projects} onChange={e => setEditForm({...editForm, projects: e.target.value})} className="w-full text-sm border-gray-300 rounded-md" placeholder="Comma separated" rows={2} />
                  ) : (
                    <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                      {userProfile.projects?.length > 0 ? userProfile.projects.map((p: string, i: number) => <li key={i}>{p}</li>) : <li className="text-gray-400 italic list-none">No projects added</li>}
                    </ul>
                  )}
                </div>

                {/* Internships & Certifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Briefcase size={16} className="text-green-500"/> Internships
                    </p>
                    {isEditing ? (
                      <textarea value={editForm.internships} onChange={e => setEditForm({...editForm, internships: e.target.value})} className="w-full text-sm border-gray-300 rounded-md" placeholder="Comma separated" rows={2} />
                    ) : (
                      <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                        {userProfile.internships?.length > 0 ? userProfile.internships.map((p: string, i: number) => <li key={i}>{p}</li>) : <li className="text-gray-400 italic list-none">No internships added</li>}
                      </ul>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Award size={16} className="text-yellow-500"/> Certifications
                    </p>
                    {isEditing ? (
                      <textarea value={editForm.certifications} onChange={e => setEditForm({...editForm, certifications: e.target.value})} className="w-full text-sm border-gray-300 rounded-md" placeholder="Comma separated" rows={2} />
                    ) : (
                      <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                        {userProfile.certifications?.length > 0 ? userProfile.certifications.map((p: string, i: number) => <li key={i}>{p}</li>) : <li className="text-gray-400 italic list-none">No certifications added</li>}
                      </ul>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
