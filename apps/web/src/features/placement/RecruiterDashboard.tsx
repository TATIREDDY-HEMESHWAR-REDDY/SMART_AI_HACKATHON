import React, { useState, useEffect } from 'react';
import { RoleGuard } from '@campus-os/ui';
import { Users, Briefcase, FileSearch, Building, Clock, FileText, Filter, ChevronRight, X, ExternalLink } from 'lucide-react';

export const RecruiterDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [recruiter, setRecruiter] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const [form, setForm] = useState({ companyId: '', designation: '' });
  const [newCompany, setNewCompany] = useState({ name: '', website: '', industry: '' });
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRoles = user?.roles || [];

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [recRes, compRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/placement/recruiters/me', { headers }),
        fetch('http://localhost:3000/api/v1/placement/companies', { headers })
      ]);
      const recData = await recRes.json();
      const compData = await compRes.json();
      
      if (recData.success && recData.data.recruiter) {
        setRecruiter(recData.data.recruiter);
        if (recData.data.recruiter.isVerified) {
          fetchDrives(headers);
        }
      }
      if (compData.success) {
        setCompanies(compData.data.companies);
      }
    } catch(e) { console.error(e); }
  };

  const fetchDrives = async (headers: any) => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/placement/recruiters/me/drives', { headers });
      const data = await res.json();
      if (data.success) {
        setDrives(data.data.drives);
      }
    } catch(e) { console.error(e); }
  };

  const fetchApplicants = async (job: any) => {
    setSelectedJob(job);
    setApplications([]);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/placement/recruiters/me/jobs/${job.id}/applicants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.data.applications);
      }
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    if (userRoles.includes('RECRUITER')) {
      fetchData();
    }
  }, []);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
      let finalCompanyId = form.companyId;

      if (isNewCompany) {
        const compRes = await fetch('http://localhost:3000/api/v1/placement/companies', {
          method: 'POST', headers, body: JSON.stringify(newCompany)
        });
        const compData = await compRes.json();
        if (!compData.success) throw new Error(compData.error?.message || 'Failed to create company');
        finalCompanyId = compData.data.company.id;
      }

      if (!finalCompanyId) throw new Error('Please select or create a company');

      const res = await fetch('http://localhost:3000/api/v1/placement/recruiters/onboard', {
        method: 'POST', headers, body: JSON.stringify({ companyId: finalCompanyId, designation: form.designation })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to onboard');

      setSuccessMsg('Onboarding request submitted! Waiting for TPO approval.');
      fetchData();
    } catch(e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => statusFilter === 'ALL' || app.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'SHORTLISTED': return 'bg-purple-100 text-purple-800';
      case 'SELECTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'WITHDRAWN': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!userRoles.includes('RECRUITER')) {
    return <RoleGuard allowedRoles={['RECRUITER']} userRoles={userRoles}><div/></RoleGuard>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Recruitment Dashboard</h2>
        <p className="text-gray-500">
          Manage your pipelines, review applicants, and shortlist candidates seamlessly.
        </p>
      </div>

      {errorMsg && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{errorMsg}</div>}
      {successMsg && <div className="bg-green-50 text-green-700 p-4 rounded-lg">{successMsg}</div>}

      {!recruiter ? (
        <div className="bg-white p-8 border rounded-xl shadow-sm max-w-2xl mx-auto">
           <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Building className="text-indigo-600"/> Recruiter Onboarding</h3>
           <p className="text-gray-600 mb-6 text-sm">Please register your company profile. TPO will verify your access before you can post jobs or review applicants.</p>
           
           <form onSubmit={handleOnboard} className="space-y-4">
             <div className="flex items-center gap-4 mb-4">
               <label className="flex items-center gap-2 text-sm cursor-pointer">
                 <input type="radio" checked={!isNewCompany} onChange={() => setIsNewCompany(false)} /> Join Existing Company
               </label>
               <label className="flex items-center gap-2 text-sm cursor-pointer">
                 <input type="radio" checked={isNewCompany} onChange={() => setIsNewCompany(true)} /> Register New Company
               </label>
             </div>

             {!isNewCompany ? (
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Select Company</label>
                 <select required className="w-full border rounded-lg p-2" value={form.companyId} onChange={e => setForm({...form, companyId: e.target.value})}>
                   <option value="">-- Select --</option>
                   {companies.filter(c => c.verificationStatus === 'VERIFIED').map(c => (
                     <option key={c.id} value={c.id}>{c.name}</option>
                   ))}
                 </select>
               </div>
             ) : (
               <div className="space-y-4 border p-4 rounded bg-gray-50">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                    <input required type="text" className="w-full border rounded p-2 text-sm" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                    <input required type="url" className="w-full border rounded p-2 text-sm" value={newCompany.website} onChange={e => setNewCompany({...newCompany, website: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
                    <input required type="text" className="w-full border rounded p-2 text-sm" value={newCompany.industry} onChange={e => setNewCompany({...newCompany, industry: e.target.value})} />
                  </div>
               </div>
             )}

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Your Designation / Job Title</label>
               <input required type="text" className="w-full border rounded-lg p-2" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} placeholder="e.g. Senior HR Manager" />
             </div>

             <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg py-2 font-bold mt-4">
               Submit Request
             </button>
           </form>
        </div>
      ) : !recruiter.isVerified ? (
        <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-xl shadow-sm text-center max-w-2xl mx-auto">
           <Clock className="mx-auto text-yellow-600 mb-4" size={48} />
           <h3 className="text-xl font-bold text-yellow-800 mb-2">Pending TPO Approval</h3>
           <p className="text-yellow-700">Your registration for <strong>{recruiter.company?.name}</strong> is currently under review by the Training & Placement Office. You will gain full access to the pipeline once verified.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
           {/* Sidebar: Drives and Jobs */}
           <div className="w-full lg:w-1/3 space-y-6">
              <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
                 <div className="p-4 bg-gray-50 border-b">
                   <h3 className="font-bold text-gray-800 flex items-center gap-2"><Briefcase size={18} /> Our Active Drives</h3>
                 </div>
                 <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                    {drives.length === 0 && <p className="text-sm text-gray-500 italic">No drives active.</p>}
                    {drives.map(drive => (
                       <div key={drive.id} className="border border-indigo-100 rounded-lg overflow-hidden">
                          <div className="bg-indigo-50 p-3 flex justify-between items-center cursor-pointer">
                            <span className="font-semibold text-indigo-900 text-sm">{drive.title}</span>
                            <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">{drive.status}</span>
                          </div>
                          <div className="p-2 space-y-2 bg-white">
                             {drive.jobs?.length === 0 && <p className="text-xs text-gray-400 p-2">No jobs in this drive.</p>}
                             {drive.jobs?.map((job: any) => (
                               <button 
                                 key={job.id} 
                                 onClick={() => fetchApplicants(job)}
                                 className={`w-full text-left p-3 rounded flex justify-between items-center transition-colors ${selectedJob?.id === job.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-50 border'}`}
                               >
                                  <div>
                                     <div className="font-medium text-sm">{job.title}</div>
                                     <div className={`text-xs mt-1 ${selectedJob?.id === job.id ? 'text-indigo-200' : 'text-gray-500'}`}>{job.location}</div>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${selectedJob?.id === job.id ? 'bg-white text-indigo-600' : 'bg-gray-100 text-gray-700'}`}>
                                       {job._count?.applications || 0} Apps
                                    </span>
                                    <ChevronRight size={16} className={`mt-1 ${selectedJob?.id === job.id ? 'text-white' : 'text-gray-400'}`} />
                                  </div>
                               </button>
                             ))}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Main Area: Applicant Pipeline */}
           <div className="w-full lg:w-2/3">
             {selectedJob ? (
               <div className="bg-white border rounded-xl shadow-sm h-full flex flex-col">
                  {/* Header */}
                  <div className="p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div>
                       <h3 className="text-2xl font-bold text-gray-800">{selectedJob.title}</h3>
                       <p className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                         <span><Briefcase size={14} className="inline mr-1" /> {selectedJob.packageDetails}</span>
                         <span><FileSearch size={14} className="inline mr-1" /> {applications.length} Applicants</span>
                       </p>
                     </div>
                     <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                       <Filter size={16} className="text-gray-500 mx-2" />
                       <select 
                         className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none py-1 pr-4" 
                         value={statusFilter} 
                         onChange={(e) => setStatusFilter(e.target.value)}
                       >
                         <option value="ALL">All Statuses</option>
                         <option value="APPLIED">Applied</option>
                         <option value="UNDER_REVIEW">Under Review</option>
                         <option value="SHORTLISTED">Shortlisted</option>
                         <option value="SELECTED">Selected</option>
                         <option value="REJECTED">Rejected</option>
                         <option value="WITHDRAWN">Withdrawn</option>
                       </select>
                     </div>
                  </div>

                  {/* Applicant Grid */}
                  <div className="p-6 bg-gray-50 flex-1 overflow-y-auto">
                     {filteredApplications.length === 0 ? (
                       <div className="text-center py-12 text-gray-400">
                         <Users size={48} className="mx-auto mb-4 opacity-50" />
                         <p>No applicants found matching this filter.</p>
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredApplications.map(app => (
                            <div key={app.id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                               <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                                      {app.student?.firstName + ' ' + app.student?.lastName?.charAt(0) || 'S'}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-gray-800">{app.student?.firstName + ' ' + app.student?.lastName}</h4>
                                      <p className="text-xs text-gray-500">{app.student?.program?.name}</p>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${getStatusColor(app.status)}`}>
                                    {app.status}
                                  </span>
                               </div>
                               
                               <div className="grid grid-cols-2 gap-2 text-sm mb-4 bg-gray-50 p-3 rounded">
                                 <div>
                                   <span className="text-gray-500 text-xs block">CGPA</span>
                                   <span className="font-semibold text-gray-800">{app.student?.cgpa}</span>
                                 </div>
                                 <div>
                                   <span className="text-gray-500 text-xs block">Backlogs</span>
                                   <span className="font-semibold text-gray-800">{app.student?.activeBacklogs}</span>
                                 </div>
                                 <div className="col-span-2">
                                   <span className="text-gray-500 text-xs block">Top Skills</span>
                                   <span className="font-semibold text-gray-800 truncate block">
                                      {app.student?.skills?.slice(0, 3).join(', ') || 'N/A'}
                                   </span>
                                 </div>
                               </div>

                               <div className="flex gap-2">
                                 <a 
                                   href={app.resume?.fileUrl} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="flex-1 border text-gray-700 bg-white hover:bg-gray-50 rounded py-2 text-xs font-bold flex justify-center items-center gap-1 transition-colors"
                                 >
                                   <FileText size={14}/> View Resume
                                 </a>
                               </div>
                            </div>
                          ))}
                       </div>
                     )}
                  </div>
               </div>
             ) : (
               <div className="bg-white border rounded-xl shadow-sm h-full flex flex-col items-center justify-center p-12 text-center text-gray-400">
                  <FileSearch size={64} className="mb-4 opacity-50 text-indigo-300" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Job</h3>
                  <p className="max-w-md">Choose a job from the sidebar to view its applicant pipeline, filter candidates, and review resumes.</p>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

