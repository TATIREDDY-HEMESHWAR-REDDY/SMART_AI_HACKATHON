import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '@/services/jobService';
import { JobCard } from '@/components/career/jobs/JobCard';
import { Search, MapPin, Briefcase, Bookmark, Layers } from 'lucide-react';

export default function JobsDashboard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [location, setLocation] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', search, employmentType, location],
    queryFn: () => jobService.getJobs(search, employmentType, location)
  });

  const { data: savedJobs} = useQuery({
    queryKey: ['savedJobs'],
    queryFn: jobService.getSavedJobs
  });
  
  const { data: applications} = useQuery({
    queryKey: ['applications'],
    queryFn: jobService.getApplications
  });

  const saveMutation = useMutation({
    mutationFn: (jobId: number) => jobService.saveJob(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedJobs'] }),
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId: number) => jobService.unsaveJob(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedJobs'] }),
  });

  const toggleSave = (jobId: number) => {
    const isSaved = savedJobs?.some(sj => sj.job_id === jobId);
    if (isSaved) {
      unsaveMutation.mutate(jobId);
    } else {
      saveMutation.mutate(jobId);
    }
  };

  const savedJobIds = new Set(savedJobs?.map(sj => sj.job_id) || []);
  
  const displayJobs = activeTab === 'all' 
    ? jobs 
    : savedJobs?.map(sj => sj.job).filter(j => 
        (search === '' || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())) &&
        (employmentType === '' || j.employment_type === employmentType) &&
        (location === '' || j.location.toLowerCase().includes(location.toLowerCase()))
      ) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Find roles that fit your career.</h1>
        <p className="text-lg text-gray-600">Discover opportunities and see exactly how your skills match each role.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{jobs?.length || 0}</div>
          <div className="text-sm text-gray-500 font-medium">Jobs Available</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setActiveTab('saved')}>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{savedJobs?.length || 0}</div>
          <div className="text-sm text-gray-500 font-medium">Saved Jobs</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{applications?.length || 0}</div>
          <div className="text-sm text-gray-500 font-medium">Applications</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Job title, company, or keyword" 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Location" 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <select 
            className="w-full md:w-48 py-2 px-4 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
          >
            <option value="">All Job Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button 
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('all')}
        >
          All Jobs
        </button>
        <button 
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors flex items-center ${activeTab === 'saved' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Roles
          {savedJobs && savedJobs.length > 0 && (
            <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{savedJobs.length}</span>
          )}
        </button>
      </div>

      {jobsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 h-64 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="flex gap-2 mb-8">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-full mt-auto"></div>
            </div>
          ))}
        </div>
      ) : displayJobs && displayJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayJobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              isSaved={savedJobIds.has(job.id)}
              onToggleSave={toggleSave}
              isSaving={saveMutation.isPending || unsaveMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {activeTab === 'saved' ? "No saved jobs yet." : "No roles match your search."}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'saved' 
              ? "Save roles you're interested in and they'll appear here." 
              : "Try adjusting your filters or search terms to find more opportunities."}
          </p>
        </div>
      )}
    </div>
  );
}
