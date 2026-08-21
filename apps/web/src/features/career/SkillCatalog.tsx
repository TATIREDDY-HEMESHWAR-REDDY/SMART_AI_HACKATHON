import React, { useState, useEffect } from 'react';
import { RoleGuard } from '@campus-os/ui';

export const SkillCatalog: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [addingSkill, setAddingSkill] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/career/skills', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to fetch');
      
      setSkills(result.data?.skills || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async (skillId: string, level: string) => {
    try {
      setAddingSkill(skillId);
      setAddError(null);
      const response = await fetch('http://localhost:3000/api/v1/career/skills/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ skillId, proficiencyLevel: level })
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to add skill');
      
      alert('Skill added successfully!');
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setAddingSkill(null);
    }
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRoles = user?.roles || [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Skill Catalog</h2>
      <p className="text-gray-600 mb-6">Browse and add skills to your profile.</p>

      {loading && <div className="text-gray-500">Loading catalog...</div>}
      
      {error && <div className="text-red-500 bg-red-50 p-4 rounded-md mb-4">{error}</div>}
      {addError && <div className="text-red-500 bg-red-50 p-4 rounded-md mb-4">Error adding skill: {addError}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 p-8 border rounded-xl">No skills available in the catalog.</div>
          ) : (
            skills.map((skill) => (
              <div key={skill.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                <div className="flex-1">
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded mb-2">{skill.category}</span>
                  <h3 className="font-semibold text-lg">{skill.name}</h3>
                </div>
                
                <RoleGuard allowedRoles={['STUDENT']} userRoles={userRoles}>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <select 
                      id={`level-${skill.id}`} 
                      className="border rounded p-1 text-sm bg-gray-50"
                      defaultValue="BEGINNER"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                    <button 
                      onClick={() => {
                        const select = document.getElementById(`level-${skill.id}`) as HTMLSelectElement;
                        handleAddSkill(skill.id, select.value);
                      }}
                      disabled={addingSkill === skill.id}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded disabled:bg-blue-300"
                    >
                      {addingSkill === skill.id ? 'Adding...' : 'Add to Profile'}
                    </button>
                  </div>
                </RoleGuard>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
