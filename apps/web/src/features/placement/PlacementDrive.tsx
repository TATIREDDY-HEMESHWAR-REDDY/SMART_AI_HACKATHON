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
    title: '', packageDetails: '', location: '', 
    minCgpa: '', allowedBranches: '', maxBacklogs: '' 
  });
  
  // Minimal deterministic state for Demo
  const [companies, setCompanies] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);

  // Parse user roles
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRoles = user?.roles || [];

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/v1/placement/companies', {
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
      const res = await fetch('/api/v1/placement/drives', {
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

  const handleAddJob = async (e: React.FormEvent, driveId: string) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = {
        title: jobForm.title,
        packageDetails: jobForm.packageDetails,
        location: jobForm.location,
        eligibility: {
          minCgpa: parseFloat(jobForm.minCgpa),
          allowedBranches: jobForm.allowedBranches.split(',').map(b => b.trim()),
          maxBacklogs: parseInt(jobForm.maxBacklogs, 10)
        }
      };
      const res = await fetch(`/api/v1/placement/drives/${driveId}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Job added to drive successfully.');
        setJobForm({ title: '', packageDetails: '', location: '', minCgpa: '', allowedBranches: '', maxBacklogs: '' });
      } else {
        setErrorMsg(data.error?.message || 'Failed to add job.');
      }
    } catch (err) {
      setErrorMsg('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['TPO', 'RECRUITER']} userRoles={userRoles}>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Placement Drive Management</h2>
          <p className="text-gray-500">Create companies, set up drives, and define deterministic job eligibility rules.</p>
        </div>

        {successMsg && <div className="bg-green-50 text-green-700 p-4 rounded-lg">{successMsg}</div>}
        {errorMsg && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{errorMsg}</div>}

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
        <div className="bg-white p-6 border rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-4 text-indigo-600">
            <FileSignature className="w-5 h-5" />
            <h3 className="text-xl font-semibold text-gray-800">3. Add Jobs & Eligibility</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">Define deterministic eligibility rules. No AI evaluation permitted.</p>
          
          <div className="space-y-6">
            {drives.map(drive => (
              <div key={drive.id} className="border p-4 rounded-lg bg-gray-50">
                <h4 className="font-bold text-lg mb-4">{drive.title}</h4>
                <form onSubmit={(e) => handleAddJob(e, drive.id)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
                    <input required type="text" className="w-full border rounded p-1.5 text-sm" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
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

      </div>
    </RoleGuard>
  );
};
