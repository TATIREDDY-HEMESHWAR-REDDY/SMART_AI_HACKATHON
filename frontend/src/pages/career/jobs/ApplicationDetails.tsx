import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '@/services/jobService';
import { resumeService } from '@/services/resumeService';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Building, MapPin, Briefcase, Calendar, FileText, Clock, Send, MessageSquare } from 'lucide-react';

export default function ApplicationDetails() {
  const { id } = useParams();
  const appId = parseInt(id || '0', 10);
  const queryClient = useQueryClient();
  
  const [activityType, setActivityType] = useState('NOTE');
  const [activityContent, setActivityContent] = useState('');

  const { data: application, isLoading, error } = useQuery({
    queryKey: ['application', appId],
    queryFn: () => jobService.getApplication(appId),
    enabled: !!appId
  });

  const { data: resumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeService.getResumes
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => jobService.updateApplicationStatus(appId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', appId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });

  const activityMutation = useMutation({
    mutationFn: () => jobService.addApplicationActivity(appId, activityType, activityContent),
    onSuccess: () => {
      setActivityContent('');
      setActivityType('NOTE');
      queryClient.invalidateQueries({ queryKey: ['application', appId] });
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 h-48"></div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 h-64"></div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 h-96"></div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application not found</h2>
        <p className="text-gray-500 mb-6">This application may have been removed or doesn't exist.</p>
        <Link to="/career/applications" className="text-blue-600 hover:underline">← Back to Tracker</Link>
      </div>
    );
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus && newStatus !== application.status) {
      statusMutation.mutate(newStatus);
    }
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityContent.trim()) return;
    activityMutation.mutate();
  };

  const resume = resumes?.find((r: any) => r.id === application.resume_id);
  const activities = [...application.activities].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/career/applications" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Applications
      </Link>

      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{application.job.title}</h1>
          <div className="flex flex-wrap items-center text-gray-600 gap-4 mb-2">
            <span className="flex items-center font-medium">
              <Building className="w-4 h-4 mr-1.5 text-gray-400" /> {application.job.company}
            </span>
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1.5 text-gray-400" /> {application.job.location}
            </span>
            <span className="flex items-center">
              <Briefcase className="w-4 h-4 mr-1.5 text-gray-400" /> {application.job.employment_type.replace('_', ' ')}
            </span>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <Calendar className="w-4 h-4 mr-1.5" /> Applied {new Date(application.applied_at).toLocaleDateString()}
          </div>
        </div>

        <div className="flex flex-col items-end">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Status</label>
          <div className="flex items-center gap-2">
            {statusMutation.isPending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
            <select 
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-48 p-2 font-medium"
              value={application.status}
              onChange={handleStatusChange}
              disabled={statusMutation.isPending}
            >
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {application.status === 'INTERVIEWING' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between shadow-sm">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-bold text-amber-900">Prepare for Interview</h3>
            <p className="text-amber-700 mt-1">Use our AI Coach to practice role-specific questions and refine your answers.</p>
          </div>
          <Link to={`/career/interview/setup`}>
            <button className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-sm whitespace-nowrap">
              Practice Now
            </button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Application Documents</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Job Description</h4>
                    <p className="text-xs text-gray-500 mb-3">{application.job.company} • {application.job.location}</p>
                    <Link to={`/career/jobs/${application.job_id}`}>
                      <button className="text-sm text-blue-600 font-medium hover:underline">View Job Details</button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Selected Resume</h4>
                    <p className="text-xs text-gray-500 mb-3 truncate max-w-[200px]" title={resume?.title || `Resume #${application.resume_id}`}>
                      {resume?.title || `Resume #${application.resume_id}`}
                    </p>
                    <Link to="/career/resume">
                      <button className="text-sm text-blue-600 font-medium hover:underline">Manage Resumes</button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Activity Timeline</h3>
            
            <div className="mb-8 relative">
              <div className="absolute top-0 bottom-0 left-4 w-px bg-gray-200"></div>
              <div className="space-y-6">
                {activities.map((act) => (
                  <div key={act.id} className="relative pl-10">
                    <div className="absolute left-2.5 top-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white ring-2 ring-blue-100"></div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-white">
                          {act.activity_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(act.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{act.content}</p>
                    </div>
                  </div>
                ))}
                
                <div className="relative pl-10">
                  <div className="absolute left-2.5 top-1 w-3 h-3 bg-gray-300 rounded-full border-2 border-white"></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Application Submitted</h4>
                    <p className="text-xs text-gray-500 mt-1">{new Date(application.applied_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddActivity} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-gray-500" /> Add Update
              </h4>
              <div className="space-y-3">
                <select 
                  className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                >
                  <option value="NOTE">Note</option>
                  <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                  <option value="STATUS_CHANGE">Status Change Details</option>
                </select>
                <textarea 
                  className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-3 border outline-none min-h-[100px]"
                  placeholder="E.g., Recruiter reached out, completed OA, etc..."
                  value={activityContent}
                  onChange={(e) => setActivityContent(e.target.value)}
                />
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={activityMutation.isPending || !activityContent.trim()}
                  >
                    {activityMutation.isPending ? 'Saving...' : (
                      <>
                        <Send className="w-3 h-3 mr-2" /> Add Update
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </Card>
        </div>

        <div>
          <Card className="p-6 bg-white border border-gray-200 sticky top-6">
            <h3 className="text-md font-bold text-gray-900 mb-4 border-b pb-2">Status Guide</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-3 flex-shrink-0"></div>
                <div>
                  <span className="text-sm font-bold text-gray-900 block mb-1">Applied</span>
                  <p className="text-xs text-gray-500">Your application has been submitted to the employer.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 mr-3 flex-shrink-0"></div>
                <div>
                  <span className="text-sm font-bold text-gray-900 block mb-1">Interviewing</span>
                  <p className="text-xs text-gray-500">You're actively in the interview loop. Time to prepare!</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-3 flex-shrink-0"></div>
                <div>
                  <span className="text-sm font-bold text-gray-900 block mb-1">Offer</span>
                  <p className="text-xs text-gray-500">Congratulations! You've received an offer.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-3 flex-shrink-0"></div>
                <div>
                  <span className="text-sm font-bold text-gray-900 block mb-1">Rejected</span>
                  <p className="text-xs text-gray-500">Not this time. Keep applying and expanding your options.</p>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
