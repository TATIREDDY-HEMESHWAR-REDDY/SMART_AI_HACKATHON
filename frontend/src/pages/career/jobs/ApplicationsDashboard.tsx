import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/services/jobService';
import { ApplicationCard } from '@/components/career/jobs/ApplicationCard';
import { Briefcase, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ApplicationsDashboard() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: jobService.getApplications
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-10 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-10 animate-pulse"></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 h-24 animate-pulse"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 min-h-[400px]">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
              <div className="bg-white p-4 rounded border border-gray-200 h-32 mb-3 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your career journey starts here.</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Find a role, apply with your best resume, and track everything from one place.
        </p>
        <Link to="/career/jobs">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            Explore Jobs
          </button>
        </Link>
      </div>
    );
  }

  const columns = [
    { id: 'APPLIED', title: 'Applied', icon: <Calendar className="w-4 h-4 text-blue-500" /> },
    { id: 'INTERVIEWING', title: 'Interviewing', icon: <Briefcase className="w-4 h-4 text-amber-500" /> },
    { id: 'OFFER', title: 'Offers', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
    { id: 'REJECTED', title: 'Rejected', icon: <XCircle className="w-4 h-4 text-gray-400" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
        <p className="text-gray-600">Track every opportunity from application to offer.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Total</div>
        </div>
        {columns.map(col => {
          const count = applications.filter(a => a.status === col.id).length;
          return (
            <div key={col.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{col.title}</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
        {columns.map(col => {
          const colApps = applications.filter(a => a.status === col.id);
          return (
            <div key={col.id} className="flex-1 min-w-[280px] bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700 flex items-center">
                  {col.icon}
                  <span className="ml-2">{col.title}</span>
                </h3>
                <span className="bg-white text-gray-500 text-xs py-0.5 px-2 rounded-full border border-gray-200 font-medium">
                  {colApps.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {colApps.map(app => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
                {colApps.length === 0 && (
                  <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm font-medium">
                    No applications here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
