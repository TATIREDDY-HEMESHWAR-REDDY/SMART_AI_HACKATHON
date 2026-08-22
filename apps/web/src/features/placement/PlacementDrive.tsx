import React, { useState } from 'react';
import { RoleGuard } from '@campus-os/ui';
import { Building, Briefcase, FileSignature, Save, Plus, CheckCircle, XCircle } from 'lucide-react';

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
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  // Parse user roles
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRoles = user?.roles || [];
  const isStudent = userRoles.includes('STUDENT');

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const reqs = [
        fetch('http://localhost:3000/api/v1/placement/companies', { headers }),
        fetch('http://localhost:3000/api/v1/placement/drives', { headers }),
        fetch('http://localhost:3000/api/v1/placement/jobs', { headers })
      ];
      if (isStudent) {
         reqs.push(fetch('http://localhost:3000/api/v1/placement/applications/me', { headers }));
      }
      const responses = await Promise.all(reqs);
      
      const compData = await responses[0].json();
      const driveData = await responses[1].json();
      const jobData = await responses[2].json();
      
      if (compData.success) setCompanies(compData.data.companies);
      if (driveData.success) setDrives(driveData.data.drives);
      if (jobData.success) setJobs(jobData.data.jobs);
      
      if (isStudent && responses[3]) {
         const appData = await responses[3].json();
         if (appData.success) setApplications(appData.data.applications);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [isStudent]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/v1/placement/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(companyForm)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Company created successfully!');
        setCompanyForm({ name: '', website: '', industry: '' });
        fetchData();
      } else throw new Error(data.error?.message || 'Error creating company');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 3000);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/v1/placement/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...driveForm, registrationDeadline: new Date(driveForm.registrationDeadline).toISOString() })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Drive created successfully!');
        setDriveForm({ companyId: '', title: '', description: '', registrationDeadline: '' });
        fetchData();
      } else throw new Error(data.error?.message || 'Error creating drive');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 3000);
    }
  };

  const handleUpdateDriveStatus = async (driveId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/placement/drives/${driveId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch(e) { console.error(e); }
  };

  const handleAddJob = async (e: React.FormEvent, driveId: string) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: jobForm.title,
        description: jobForm.description,
        packageDetails: jobForm.packageDetails,
        location: jobForm.location,
        skills: jobForm.skills ? jobForm.skills.split(',').map(s => s.trim()) : [],
        selectionSteps: jobForm.selectionSteps ? jobForm.selectionSteps.split(',').map(s => s.trim()) : [],
        eligibility: {
          minCgpa: parseFloat(jobForm.minCgpa),
          allowedBranches: jobForm.allowedBranches ? jobForm.allowedBranches.split(',').map(s => s.trim()) : [],
          maxBacklogs: parseInt(jobForm.maxBacklogs)
        }
      };

      const res = await fetch(`http://localhost:3000/api/v1/placement/drives/${driveId}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Job added successfully!');
        setJobForm({ title: '', description: '', packageDetails: '', location: '', skills: '', selectionSteps: '', minCgpa: '', allowedBranches: '', maxBacklogs: '' });
        fetchData();
      } else throw new Error(data.error?.message || 'Error adding job');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 3000);
    }
  };

  const checkEligibility = async (jobId: string) => {
    setSelectedJob(jobId);
    setEligibilityResult(null);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/placement/jobs/${jobId}/eligibility`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setEligibilityResult(data.data);
      } else {
        alert(data.message || 'Failed to check eligibility');
        setEligibilityResult(null);
      }
    } catch(e) { console.error(e); }
  };

  const applyForJob = async (jobId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/placement/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({}) // Uses primary resume automatically
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Applied successfully!');
        setEligibilityResult(null);
        setSelectedJob(null);
        fetchData();
      } else {
        setErrorMsg('Failed to apply: ' + data.message);
      }
    } catch(e) { console.error(e); }
  };

  return (
    <RoleGuard allowedRoles={['TPO', 'RECRUITER', 'STUDENT']} userRoles={userRoles}>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Placement Portal</h2>
          <p className="text-gray-500">
            {isStudent ? 'View drives, check your eligibility, and apply to jobs.' : 'Create companies, set up drives, and define deterministic job eligibility rules.'}
          </p>
        </div>

        {successMsg && <div className="bg-green-50 text-green-700 p-4 rounded-lg">{successMsg}</div>}
        {errorMsg && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{errorMsg}</div>}

        {isStudent ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {drives.filter(d => d.status === 'PUBLISHED').map(drive => {
                const driveJobs = jobs.filter(j => j.driveId === drive.id);
                return (
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
                  <div className="space-y-4">
                     <h5 className="font-semibold text-gray-700">Available Jobs</h5>
                     {driveJobs.length === 0 && <p className="text-sm text-gray-400">No jobs listed yet.</p>}
                     {driveJobs.map(job => {
                        const hasApplied = applications.some(a => a.jobId === job.id);
                        return (
                          <div key={job.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center">
                               <div>
                                 <h6 className="font-bold text-indigo-700">{job.title}</h6>
                                 <p className="text-xs text-gray-600 mt-1">{job.location} | Skills: {job.skills?.join(', ')}</p>
                               </div>
                               <span className="text-sm font-bold text-gray-700">{job.packageDetails}</span>
                            </div>
                            
                            {hasApplied ? (
                              <button disabled className="mt-3 w-full bg-green-100 text-green-700 rounded py-2 text-sm font-bold flex items-center justify-center gap-1 cursor-not-allowed border border-green-200 shadow-sm"><CheckCircle size={16}/> Already Applied</button>
                            ) : (
                              <button onClick={() => checkEligibility(job.id)} className="mt-3 w-full bg-indigo-600 text-white rounded py-2 text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors">Check Eligibility & Apply</button>
                            )}
                          </div>
                        );
                     })}
                  </div>
                </div>
              )})}
              {drives.filter(d => d.status === 'PUBLISHED').length === 0 && (
                <div className="col-span-full text-center text-gray-400 italic py-8">
                  No active placement drives at the moment.
                </div>
              )}
            </div>

            {applications.length > 0 && (
               <div className="mt-8 bg-white p-6 border rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">My Applications</h3>
                  <div className="space-y-3">
                     {applications.map(app => (
                        <div key={app.id} className="flex justify-between items-center p-4 border rounded-lg bg-gray-50">
                           <div>
                             <h4 className="font-bold text-gray-800">{app.job?.title}</h4>
                             <p className="text-sm text-gray-500">{app.job?.drive?.company?.name}</p>
                           </div>
                           <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider">{app.status}</span>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Eligibility Modal */}
            {eligibilityResult && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Eligibility Engine <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full ml-2">Module Q</span></h3>
                  <p className="text-sm text-gray-500 mb-6">Deterministic check against job requirements.</p>
                  
                  <div className="space-y-3 mb-6">
                     {eligibilityResult.criteria.map((c: any, i: number) => (
                       <div key={i} className="flex justify-between items-center text-sm p-3 border rounded bg-gray-50">
                          <div>
                            <p className="font-semibold text-gray-800">{c.name}</p>
                            <p className="text-xs text-gray-500 mt-1">Req: {c.required} | You: {c.actual}</p>
                          </div>
                          {c.passed ? <CheckCircle className="text-green-500 flex-shrink-0" size={24} /> : <XCircle className="text-red-500 flex-shrink-0" size={24} />}
                       </div>
                     ))}
                     {eligibilityResult.criteria.length === 0 && (
                       <p className="text-sm text-gray-500">No specific eligibility rules required for this job.</p>
                     )}
                  </div>
                  <div className="flex gap-3 mt-8">
                     <button onClick={() => setEligibilityResult(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                     <button 
                       onClick={() => applyForJob(selectedJob!)}
                       disabled={!eligibilityResult.isEligible} 
                       className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-colors ${eligibilityResult.isEligible ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}`}
                     >
                       {eligibilityResult.isEligible ? 'Submit Application' : 'Not Eligible'}
                     </button>
                  </div>
                </div>
              </div>
            )}
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
