import React, { useState } from 'react';
import { RoleGuard } from '@campus-os/ui';
import { Building, Briefcase, FileSignature, Save, Plus } from 'lucide-react';

export const PlacementDrive = () => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // State for forms
  const [companyForm, setCompanyForm] = useState({ name: '', website: '', industry: '' });
  const [driveForm, setDriveForm] = useState({ companyId: '', title: '', description: '', registrationDeadline: '' });
  const [jobForm, setJobForm] = useState({ 
    title: '', description: '', packageDetails: '', location: '', 
    skills: '', selectionSteps: '',
    minCgpa: '', allowedBranches: '', maxBacklogs: '' 
  });
  
  // Minimal deterministic state for Demo
  const [companies, setCompanies] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);

  // Parse user roles
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRoles = user?.roles || [];

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, driveRes] = await Promise.all([
          fetch('http://localhost:3000/api/v1/placement/companies', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          fetch('http://localhost:3000/api/v1/placement/drives', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        ]);
        const compData = await compRes.json();
        const driveData = await driveRes.json();
        if (compData.success) setCompanies(compData.data.companies);
        if (driveData.success) setDrives(driveData.data.drives);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:3000/api/v1/placement/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(companyForm)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Company created successfully.');
        setCompanies([...companies, data.data.company]);
        setCompanyForm({ name: '', website: '', industry: '' });
      } else {
        setErrorMsg(data.error?.message || 'Failed to create company.');
      }
    } catch (err) {
      setErrorMsg('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = {
        ...driveForm,
        registrationDeadline: new Date(driveForm.registrationDeadline).toISOString()
      };
      const res = await fetch('http://localhost:3000/api/v1/placement/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Placement drive created successfully.');
        setDrives([...drives, data.data.drive]);
        setDriveForm({ companyId: '', title: '', description: '', registrationDeadline: '' });
      } else {
        setErrorMsg(data.error?.message || 'Failed to create drive.');
      }
    } catch (err) {
      setErrorMsg('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDriveStatus = async (driveId: string, status: string) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/v1/placement/drives/${driveId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Drive marked as ${status}.`);
        setDrives(drives.map(d => d.id === driveId ? { ...d, status } : d));
      } else {
        setErrorMsg(data.error?.message || 'Failed to update status.');
      }
    } catch (err) {
      setErrorMsg('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async (e: React.FormEvent, driveId: string) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = {
        title: jobForm.title,
        description: jobForm.description,
        packageDetails: jobForm.packageDetails,
        location: jobForm.location,
        skills: jobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        selectionSteps: jobForm.selectionSteps.split(',').map(s => s.trim()).filter(Boolean),
        eligibility: {
          minCgpa: parseFloat(jobForm.minCgpa),
          allowedBranches: jobForm.allowedBranches.split(',').map(b => b.trim()),
          maxBacklogs: parseInt(jobForm.maxBacklogs, 10)
        }
      };
      const res = await fetch(`http://localhost:3000/api/v1/placement/drives/${driveId}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Job added to drive successfully.');
        setJobForm({ title: '', description: '', packageDetails: '', location: '', skills: '', selectionSteps: '', minCgpa: '', allowedBranches: '', maxBacklogs: '' });
      } else {
        setErrorMsg(data.error?.message || 'Failed to add job.');
      }
    } catch (err) {
      setErrorMsg('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = userRoles.includes('STUDENT');

  return (
    <RoleGuard allowedRoles={['TPO', 'RECRUITER', 'STUDENT']} userRoles={userRoles}>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Placement Portal</h2>
          <p className="text-gray-500">
            {isStudent ? 'View drives and apply to jobs.' : 'Create companies, set up drives, and define deterministic job eligibility rules.'}
          </p>
        </div>

        {successMsg && <div className="bg-green-50 text-green-700 p-4 rounded-lg">{successMsg}</div>}
        {errorMsg && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{errorMsg}</div>}

        {isStudent ? (
          <div className="space-y-6">
            <div className="bg-white p-6 border rounded-xl shadow-sm text-center py-8">
              <Briefcase className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Student Placement Portal</h3>
              <p className="text-gray-500">
                View active placement drives. The application interface (Module R) is coming next.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {drives.filter(d => d.status === 'PUBLISHED').map(drive => (
                <div key={drive.id} className="border p-6 rounded-xl bg-white shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-4 border-b pb-4">
                    <div>
                      <h4 className="font-bold text-xl text-gray-800">{drive.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{drive.description}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">Active</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <p><strong>Deadline:</strong> {new Date(drive.registrationDeadline).toLocaleDateString()}</p>
                  </div>
                  <button disabled className="mt-auto w-full bg-gray-100 text-gray-500 rounded-lg py-2 cursor-not-allowed font-medium">
                    Applications Open Soon
                  </button>
                </div>
              ))}
              {drives.filter(d => d.status === 'PUBLISHED').length === 0 && (
                <div className="col-span-full text-center text-gray-400 italic py-8">
                  No active placement drives at the moment.
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Create Company */}
              <div className="bg-white p-6 border rounded-xl shadow-sm">
                <div className="flex items-center space-x-2 mb-4 text-indigo-600">
                  <Building className="w-5 h-5" />
                  <h3 className="text-xl font-semibold text-gray-800">1. Create Company</h3>
                </div>
                <form onSubmit={handleCreateCompany} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input required type="text" className="w-full border rounded-lg p-2" value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input required type="url" className="w-full border rounded-lg p-2" value={companyForm.website} onChange={e => setCompanyForm({...companyForm, website: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <input required type="text" className="w-full border rounded-lg p-2" value={companyForm.industry} onChange={e => setCompanyForm({...companyForm, industry: e.target.value})} />
                  </div>
                  <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg py-2 flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" /> <span>Save Company</span>
                  </button>
                </form>
              </div>

              {/* Create Drive */}
              <div className="bg-white p-6 border rounded-xl shadow-sm">
                <div className="flex items-center space-x-2 mb-4 text-indigo-600">
                  <Briefcase className="w-5 h-5" />
                  <h3 className="text-xl font-semibold text-gray-800">2. Create Drive</h3>
                </div>
                <form onSubmit={handleCreateDrive} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Company</label>
                    <select required className="w-full border rounded-lg p-2" value={driveForm.companyId} onChange={e => setDriveForm({...driveForm, companyId: e.target.value})}>
                      <option value="">-- Select Company --</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Drive Title</label>
                    <input required type="text" className="w-full border rounded-lg p-2" value={driveForm.title} onChange={e => setDriveForm({...driveForm, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea required className="w-full border rounded-lg p-2" value={driveForm.description} onChange={e => setDriveForm({...driveForm, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
                    <input required type="datetime-local" className="w-full border rounded-lg p-2" value={driveForm.registrationDeadline} onChange={e => setDriveForm({...driveForm, registrationDeadline: e.target.value})} />
                  </div>
                  <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg py-2 flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" /> <span>Save Drive</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Add Job to Drive */}
            <div className="bg-white p-6 border rounded-xl shadow-sm mt-8">
              <div className="flex items-center space-x-2 mb-4 text-indigo-600">
                <FileSignature className="w-5 h-5" />
                <h3 className="text-xl font-semibold text-gray-800">3. Add Jobs & Eligibility</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Define deterministic eligibility rules. No AI evaluation permitted.</p>
              
              <div className="space-y-6">
                {drives.map(drive => (
                  <div key={drive.id} className="border p-4 rounded-lg bg-gray-50 flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">{drive.title}</h4>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-100 text-indigo-700">{drive.status}</span>
                      </div>
                      <div className="space-x-2">
                        {drive.status === 'DRAFT' && (
                          <button onClick={() => handleUpdateDriveStatus(drive.id, 'PUBLISHED')} className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700">Publish Drive</button>
                        )}
                        {drive.status === 'PUBLISHED' && (
                          <button onClick={() => handleUpdateDriveStatus(drive.id, 'CLOSED')} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700">Close Drive</button>
                        )}
                      </div>
                    </div>
                    <form onSubmit={(e) => handleAddJob(e, drive.id)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
                        <input required type="text" className="w-full border rounded p-1.5 text-sm" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Job Description</label>
                        <input type="text" className="w-full border rounded p-1.5 text-sm" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Package Details</label>
                        <input required type="text" className="w-full border rounded p-1.5 text-sm" placeholder="e.g. 10 LPA" value={jobForm.packageDetails} onChange={e => setJobForm({...jobForm, packageDetails: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                        <input required type="text" className="w-full border rounded p-1.5 text-sm" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                        <input type="text" className="w-full border rounded p-1.5 text-sm" placeholder="React, Node.js" value={jobForm.skills} onChange={e => setJobForm({...jobForm, skills: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Selection Steps (comma separated)</label>
                        <input type="text" className="w-full border rounded p-1.5 text-sm" placeholder="Aptitude, Technical, HR" value={jobForm.selectionSteps} onChange={e => setJobForm({...jobForm, selectionSteps: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Min CGPA</label>
                        <input required type="number" step="0.1" min="0" max="10" className="w-full border rounded p-1.5 text-sm" value={jobForm.minCgpa} onChange={e => setJobForm({...jobForm, minCgpa: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Allowed Branches (comma separated)</label>
                        <input required type="text" className="w-full border rounded p-1.5 text-sm" placeholder="CSE, IT, ECE" value={jobForm.allowedBranches} onChange={e => setJobForm({...jobForm, allowedBranches: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Max Backlogs</label>
                        <input required type="number" min="0" className="w-full border rounded p-1.5 text-sm" value={jobForm.maxBacklogs} onChange={e => setJobForm({...jobForm, maxBacklogs: e.target.value})} />
                      </div>
                      <div className="md:col-span-2 pt-2">
                        <button disabled={loading} className="bg-indigo-600 text-white rounded px-4 py-2 text-sm flex items-center space-x-2">
                          <Plus className="w-4 h-4" /> <span>Add Job to {drive.title}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                ))}
                {drives.length === 0 && <p className="text-sm text-gray-400 italic">Create a drive first to add jobs.</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
};
