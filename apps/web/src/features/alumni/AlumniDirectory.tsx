import React, { useState, useEffect } from 'react';

interface AlumniProfile {
  id: string;
  name: string;
  graduationYear: number;
  currentCompany?: string;
  currentRole?: string;
  linkedInUrl?: string;
  expertise: string[];
  user?: { studentProfile?: { firstName: string; lastName: string } };
}

export function AlumniDirectory() {
  const [directory, setDirectory] = useState<AlumniProfile[]>([]);
  const [myProfile, setMyProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAlumni = user?.roles?.includes('ALUMNI');

  // Form states for ALUMNI
  const [formData, setFormData] = useState({
    graduationYear: 2024,
    currentCompany: '',
    currentRole: '',
    linkedInUrl: '',
    expertise: ''
  });

  useEffect(() => {
    fetchDirectory();
    if (isAlumni) {
      fetchMyProfile();
    }
  }, [isAlumni]);

  const fetchDirectory = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/alumni/directory', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDirectory(data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch directory');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProfile = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/alumni/profile/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setMyProfile(data.data);
          setFormData({
            graduationYear: data.data.graduationYear || 2024,
            currentCompany: data.data.currentCompany || '',
            currentRole: data.data.currentRole || '',
            linkedInUrl: data.data.linkedInUrl || '',
            expertise: (data.data.expertise || []).join(', ')
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/v1/alumni/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          graduationYear: formData.graduationYear,
          currentCompany: formData.currentCompany,
          currentRole: formData.currentRole,
          linkedInUrl: formData.linkedInUrl,
          expertise: formData.expertise.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMyProfile(data.data);
        fetchDirectory(); // refresh public list
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestMentorship = async (alumniId: string) => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/alumni/mentorship/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ alumniId, message })
      });
      if (res.ok) {
        alert('Mentorship requested successfully!');
        setRequestingId(null);
        setMessage('');
      } else {
        alert('Failed to request mentorship');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6">Loading Alumni Directory...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alumni Directory</h1>
        <p className="text-gray-500 mt-2">Connect with our alumni network.</p>
      </div>

      {isAlumni && (
        <div className="p-6 mb-8 bg-blue-50 border rounded shadow-sm">
          <h2 className="text-xl font-bold mb-4">Manage My Alumni Profile</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                <input 
                  type="number" 
                  value={formData.graduationYear} 
                  onChange={e => setFormData({...formData, graduationYear: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Role</label>
                <input 
                  type="text" 
                  value={formData.currentRole} 
                  onChange={e => setFormData({...formData, currentRole: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Company</label>
                <input 
                  type="text" 
                  value={formData.currentCompany} 
                  onChange={e => setFormData({...formData, currentCompany: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                <input 
                  type="url" 
                  value={formData.linkedInUrl} 
                  onChange={e => setFormData({...formData, linkedInUrl: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Expertise (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.expertise} 
                  onChange={e => setFormData({...formData, expertise: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                />
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Save Profile
            </button>
          </form>
        </div>
      )}

      {error && <div className="text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {directory.map(alumni => (
          <div key={alumni.id} className="p-6 border rounded shadow-sm bg-white">
            <h3 className="font-bold text-lg">{alumni.user?.studentProfile?.firstName ? (alumni.user.studentProfile.firstName + ' ' + alumni.user.studentProfile.lastName) : 'Anonymous Alumni'}</h3>
            <p className="text-sm text-gray-500">Class of {alumni.graduationYear}</p>
            
            <div className="mt-4 space-y-2">
              {alumni.currentRole && alumni.currentCompany && (
                <p className="text-sm"><strong>{alumni.currentRole}</strong> at {alumni.currentCompany}</p>
              )}
              {alumni.linkedInUrl && (
                <a href={alumni.linkedInUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline">
                  LinkedIn Profile
                </a>
              )}
              {alumni.expertise && alumni.expertise.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">EXPERTISE</p>
                  <div className="flex flex-wrap gap-1">
                    {alumni.expertise.map(exp => (
                      <span key={exp} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {user?.roles?.includes('STUDENT') && (
              <div className="mt-4 pt-4 border-t">
                {requestingId === alumni.id ? (
                  <div className="space-y-2">
                    <textarea 
                      className="w-full border rounded p-2 text-sm" 
                      placeholder="Why do you want mentorship?"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                    />
                    <div className="flex space-x-2">
                      <button onClick={() => handleRequestMentorship(alumni.id)} className="bg-blue-600 text-white text-xs px-3 py-1 rounded">Send Request</button>
                      <button onClick={() => setRequestingId(null)} className="text-gray-500 text-xs px-3 py-1">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setRequestingId(alumni.id)} className="text-blue-600 text-sm font-semibold hover:underline">
                    Request Mentorship
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


