import React, { useState, useEffect } from 'react';
import { RoleGuard } from '@campus-os/ui';

export const CareerProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // NOTE: We are bypassing real auth tokens for the demo and assuming the backend intercepts this
      // Actually we must fetch from our api:
      const response = await fetch('http://localhost:3000/api/v1/career/profile/me');
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to fetch');
      
      setData(result.data);
      if (result.data?.careerGoal) {
        setTargetRole(result.data.careerGoal.targetRole);
        setTargetIndustry(result.data.careerGoal.targetIndustry);
      }
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
      const response = await fetch('http://localhost:3000/api/v1/career/profile/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, targetIndustry })
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to save');
      
      await fetchProfile();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      {/* TODO: Temporarily hardcoding userRoles={['STUDENT']} due to Team 1 mock auth limitation in App.tsx. 
          Must replace with real auth context (e.g., from global state or context) once Team 1 provides frontend auth state */}
      <RoleGuard allowedRoles={['STUDENT']} userRoles={['STUDENT']}>
        <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Career Profile</h2>
        
        {loading && <div className="text-gray-500">Loading career profile...</div>}
        
        {error && <div className="text-red-500 bg-red-50 p-4 rounded-md mb-4">{error}</div>}

        {!loading && !error && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold mb-4">Career Goals</h3>
            
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-sm">
              <strong>Note:</strong> This data is currently managed in a temporary isolated layer pending Team 1 Prisma schema integration.
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Role</label>
                  <input 
                    type="text" 
                    value={targetRole} 
                    onChange={e => setTargetRole(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Industry</label>
                  <input 
                    type="text" 
                    value={targetIndustry} 
                    onChange={e => setTargetIndustry(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  />
                </div>
                <div className="flex space-x-2">
                  <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                  <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                {!data?.careerGoal ? (
                  <div className="text-gray-500 italic mb-4">No active career goal set.</div>
                ) : (
                  <div className="space-y-2 mb-4">
                    <p><span className="text-gray-500 w-32 inline-block">Role:</span> <span className="font-medium">{data.careerGoal.targetRole}</span></p>
                    <p><span className="text-gray-500 w-32 inline-block">Industry:</span> <span className="font-medium">{data.careerGoal.targetIndustry}</span></p>
                  </div>
                )}
                <button onClick={() => setIsEditing(true)} className="bg-gray-100 text-gray-800 px-4 py-2 rounded border">Edit Goals</button>
              </div>
            )}
          </div>
        )}

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
    </RoleGuard>
    </>
  );
};
