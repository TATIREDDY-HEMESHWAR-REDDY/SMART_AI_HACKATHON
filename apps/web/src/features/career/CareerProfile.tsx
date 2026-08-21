import React, { useState, useEffect } from 'react';
import { RoleGuard } from '@campus-os/ui';

export const CareerProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [interests, setInterests] = useState('');
  const [projects, setProjects] = useState('');
  const [certifications, setCertifications] = useState('');
  const [internships, setInternships] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // NOTE: We are bypassing real auth tokens for the demo and assuming the backend intercepts this
      // Actually we must fetch from our api:
      const response = await fetch('http://localhost:3000/api/v1/career/profile/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to fetch');
      
      setData(result.data);
      if (result.data?.careerGoal) {
        setTargetRole(result.data.careerGoal.targetRole);
        setTargetIndustry(result.data.careerGoal.targetIndustry);
      }
      setInterests((result.data?.interests || []).join(', '));
      setProjects((result.data?.projects || []).join(', '));
      setCertifications((result.data?.certifications || []).join(', '));
      setInternships((result.data?.internships || []).join(', '));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setError(null);
      const payload = {
        targetRole,
        targetIndustry,
        interests: interests.split(',').map(s => s.trim()).filter(Boolean),
        projects: projects.split(',').map(s => s.trim()).filter(Boolean),
        certifications: certifications.split(',').map(s => s.trim()).filter(Boolean),
        internships: internships.split(',').map(s => s.trim()).filter(Boolean),
      };
      const response = await fetch('http://localhost:3000/api/v1/career/profile/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to save');
      
      await fetchProfile();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRoles = user?.roles || [];

  return (
    <>
      <RoleGuard allowedRoles={['STUDENT']} userRoles={userRoles}>
        <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Career Profile</h2>
        
        {loading && <div className="text-gray-500">Loading career profile...</div>}
        
        {error && <div className="text-red-500 bg-red-50 p-4 rounded-md mb-4">{error}</div>}

        {!loading && !error && data && (
          <div className="space-y-6">
            {/* Readiness Summary Widget */}
            {data.readinessSummary && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">Career Readiness</h3>
                    <p className="text-blue-100 mt-1">Status: {data.readinessSummary.status}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black">{data.readinessSummary.score || 'N/A'}</div>
                    <div className="text-xs text-blue-200 mt-1">Score</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Career Goals & Background</h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="bg-gray-100 text-gray-800 px-4 py-2 rounded text-sm font-medium">Edit Profile</button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Target Role</label>
                      <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Target Industry</label>
                      <input type="text" value={targetIndustry} onChange={e => setTargetIndustry(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Interests (comma separated)</label>
                      <input type="text" value={interests} onChange={e => setInterests(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Projects (comma separated)</label>
                      <input type="text" value={projects} onChange={e => setProjects(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Certifications (comma separated)</label>
                      <input type="text" value={certifications} onChange={e => setCertifications(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Experience / Internships (comma separated)</label>
                      <input type="text" value={internships} onChange={e => setInternships(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
                    <button onClick={() => { setIsEditing(false); fetchProfile(); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Goals</h4>
                    <p className="text-gray-900">
                      {data.careerGoal ? `${data.careerGoal.targetRole} in ${data.careerGoal.targetIndustry}` : <span className="text-gray-400 italic">Not set</span>}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Interests</h4>
                      {data.interests?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">{data.interests.map((i: string, idx: number) => <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">{i}</span>)}</div>
                      ) : <span className="text-gray-400 italic text-sm">Not set</span>}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Projects</h4>
                      {data.projects?.length > 0 ? (
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">{data.projects.map((p: string, idx: number) => <li key={idx}>{p}</li>)}</ul>
                      ) : <span className="text-gray-400 italic text-sm">Not set</span>}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Certifications</h4>
                      {data.certifications?.length > 0 ? (
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">{data.certifications.map((c: string, idx: number) => <li key={idx}>{c}</li>)}</ul>
                      ) : <span className="text-gray-400 italic text-sm">Not set</span>}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Experience</h4>
                      {data.internships?.length > 0 ? (
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">{data.internships.map((c: string, idx: number) => <li key={idx}>{c}</li>)}</ul>
                      ) : <span className="text-gray-400 italic text-sm">Not set</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!loading && data?.skills && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">My Skills</h3>
            {data.skills.length === 0 ? (
              <p className="text-gray-500 italic">No skills added yet. Go to the Skill Catalog to add some.</p>
            ) : (
              <ul className="divide-y">
                {data.skills.map((s: any) => (
                  <li key={s.id} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium">{s.name}</span>
                      <span className={`ml-3 px-2 py-1 text-xs rounded-full ${s.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {s.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{s.proficiencyLevel}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
          </div>
        )}
      </div>
    </RoleGuard>
    </>
  );
};
