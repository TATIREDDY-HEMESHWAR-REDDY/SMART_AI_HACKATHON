import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careerService } from '@/services/careerService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';


export default function CareerProfile() {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ['careerProfile'],
    queryFn: careerService.getProfile,
  });

  const updateMutation = useMutation({
    mutationFn: careerService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerProfile'] });
      setEditMode(false);
    },
  });

  const handleEdit = () => {
    setFormData({
      target_role: profile?.target_role || '',
      target_domain: profile?.target_domain || '',
      career_objective: profile?.career_objective || '',
      github_url: profile?.github_url || '',
      linkedin_url: profile?.linkedin_url || '',
      portfolio_url: profile?.portfolio_url || '',
    });
    setEditMode(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Career Profile</h2>
        {!editMode && (
          <button 
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Role</label>
                  <input 
                    type="text" 
                    value={formData.target_role} 
                    onChange={e => setFormData({...formData, target_role: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Domain</label>
                  <input 
                    type="text" 
                    value={formData.target_domain} 
                    onChange={e => setFormData({...formData, target_domain: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Career Objective</label>
                <textarea 
                  value={formData.career_objective} 
                  onChange={e => setFormData({...formData, career_objective: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
                  <input 
                    type="url" 
                    value={formData.github_url} 
                    onChange={e => setFormData({...formData, github_url: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                  <input 
                    type="url" 
                    value={formData.linkedin_url} 
                    onChange={e => setFormData({...formData, linkedin_url: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Portfolio URL</label>
                  <input 
                    type="url" 
                    value={formData.portfolio_url} 
                    onChange={e => setFormData({...formData, portfolio_url: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={updateMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Target Role</h4>
                  <p className="mt-1 text-gray-900">{profile?.target_role || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Target Domain</h4>
                  <p className="mt-1 text-gray-900">{profile?.target_domain || '-'}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Career Objective</h4>
                <p className="mt-1 text-gray-900">{profile?.career_objective || '-'}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">GitHub</h4>
                  <a href={profile?.github_url} target="_blank" rel="noreferrer" className="mt-1 text-blue-600 hover:underline block truncate">{profile?.github_url || '-'}</a>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">LinkedIn</h4>
                  <a href={profile?.linkedin_url} target="_blank" rel="noreferrer" className="mt-1 text-blue-600 hover:underline block truncate">{profile?.linkedin_url || '-'}</a>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Portfolio</h4>
                  <a href={profile?.portfolio_url} target="_blank" rel="noreferrer" className="mt-1 text-blue-600 hover:underline block truncate">{profile?.portfolio_url || '-'}</a>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
