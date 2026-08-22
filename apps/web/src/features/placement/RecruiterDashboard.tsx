import React, { useState, useEffect } from 'react';
import { RoleGuard } from '@campus-os/ui';
import { Users, Briefcase, FileSearch, Building, CheckCircle, Clock } from 'lucide-react';

export const RecruiterDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [recruiter, setRecruiter] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
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
      }
      if (compData.success) {
        setCompanies(compData.data.companies);
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

  if (!userRoles.includes('RECRUITER')) {
    return <RoleGuard allowedRoles={['RECRUITER']} userRoles={userRoles}><div/></RoleGuard>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Recruitment Dashboard</h2>
        <p className="text-gray-500">
          Welcome to the Recruiter Portal. Manage your pipelines, review applicants, and shortlist candidates here.
        </p>
      </div>

      {errorMsg && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{errorMsg}</div>}
      {successMsg && <div className="bg-green-50 text-green-700 p-4 rounded-lg">{successMsg}</div>}

      {!recruiter ? (
        <div className="bg-white p-8 border rounded-xl shadow-sm max-w-2xl mx-auto">
           <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Building className="text-indigo-600"/> Recruiter Onboarding (Module S)</h3>
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
        <div className="bg-white p-8 border rounded-xl shadow-sm text-center">
          <div className="flex justify-center mb-6 space-x-4">
            <div className="p-4 bg-indigo-50 rounded-full text-indigo-600"><Users size={32} /></div>
            <div className="p-4 bg-purple-50 rounded-full text-purple-600"><FileSearch size={32} /></div>
            <div className="p-4 bg-green-50 rounded-full text-green-600"><Briefcase size={32} /></div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to {recruiter.company?.name} Pipeline</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Your recruiter account is verified! You can now manage applicant tracking, resume reviews, and shortlisting precisely from here.
          </p>
          <p className="text-sm font-semibold text-indigo-600 bg-indigo-50 inline-block px-4 py-2 rounded-full border border-indigo-100">
            Advanced Tracking Unlocking in Phase 2 (Modules T, U)
          </p>
        </div>
      )}
    </div>
  );
};
