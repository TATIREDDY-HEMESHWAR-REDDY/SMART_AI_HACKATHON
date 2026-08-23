import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '@/services/jobService';
import { resumeService } from '@/services/resumeService';
import { JobScoreRing } from '@/components/career/jobs/JobScoreRing';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Building, Briefcase, Bookmark, BookmarkCheck, ArrowLeft, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JobDetails() {
  const { id } = useParams();
  const jobId = parseInt(id || '0', 10);
  const queryClient = useQueryClient();
  
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);

  const { data: job, isLoading: jobLoading, error: jobError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobService.getJob(jobId),
    enabled: !!jobId
  });

  const { data: resumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeService.getResumes
  });

  const { data: savedJobs } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: jobService.getSavedJobs
  });

  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: jobService.getApplications
  });

  // Default select resume if only one exists or default is present
  useEffect(() => {
    if (resumes && resumes.length > 0 && !selectedResumeId) {
      const defaultRes = resumes.find((r: any) => r.is_default);
      setSelectedResumeId(defaultRes?.id || resumes[0].id || null);
    }
  }, [resumes, selectedResumeId]);

  const matchQuery = useQuery({
    queryKey: ['jobMatch', jobId, selectedResumeId],
    queryFn: () => jobService.matchJob(jobId, selectedResumeId as number, false),
    enabled: false // Triggered manually
  });

  const refreshMatchMutation = useMutation({
    mutationFn: () => jobService.matchJob(jobId, selectedResumeId as number, true),
    onSuccess: (data) => {
      queryClient.setQueryData(['jobMatch', jobId, selectedResumeId], data);
    }
  });

  const saveMutation = useMutation({
    mutationFn: () => jobService.saveJob(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedJobs'] }),
  });

  const unsaveMutation = useMutation({
    mutationFn: () => jobService.unsaveJob(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedJobs'] }),
  });

  const applyMutation = useMutation({
    mutationFn: () => jobService.createApplication(jobId, selectedResumeId as number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setShowApplyConfirm(false);
    }
  });

  const isSaved = savedJobs?.some(sj => sj.job_id === jobId) || false;
  const isApplied = applications?.some(app => app.job_id === jobId) || false;
  const application = applications?.find(app => app.job_id === jobId);

  if (jobLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white p-8 rounded-xl border border-gray-200 mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="flex gap-4 mb-4">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="text-red-500 mb-4"><AlertCircle className="w-12 h-12 mx-auto" /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
        <p className="text-gray-500 mb-6">This position may have been closed or removed.</p>
        <Link to="/career/jobs" className="text-blue-600 hover:underline">← Back to Jobs</Link>
      </div>
    );
  }

  const handleToggleSave = () => {
    if (isSaved) unsaveMutation.mutate();
    else saveMutation.mutate();
  };

  const handleAnalyzeMatch = () => {
    if (!selectedResumeId) return;
    matchQuery.refetch();
  };

  const matchData = matchQuery.data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/career/jobs" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 bg-white border border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex flex-wrap items-center text-gray-600 gap-4 mb-4">
                  <span className="flex items-center text-lg font-medium text-gray-800">
                    <Building className="w-5 h-5 mr-1.5 text-gray-500" /> {job.company}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-gray-400" /> {job.location}
                  </span>
                  <span className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1.5 text-gray-400" /> {job.employment_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleToggleSave}
                disabled={saveMutation.isPending || unsaveMutation.isPending}
                className="p-2 border border-gray-200 rounded-full text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors bg-white disabled:opacity-50"
              >
                {isSaved ? <BookmarkCheck className="w-6 h-6 text-blue-600" /> : <Bookmark className="w-6 h-6" />}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {job.requirements.map((req, i) => (
                <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 text-sm py-1 px-3">
                  {req}
                </Badge>
              ))}
            </div>

            <div className="prose max-w-none">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">About the Role</h3>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-white border border-gray-200 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Application</h3>
            
            {isApplied ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-bold text-green-900">Application Submitted</h4>
                <p className="text-sm text-green-700 mt-1">Status: {application?.status.replace('_', ' ')}</p>
                <p className="text-xs text-green-600 mt-1">Applied on {new Date(application?.applied_at || '').toLocaleDateString()}</p>
              </div>
            ) : (
              <div className="mb-6 space-y-4">
                {resumes && resumes.length > 0 ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Resume</label>
                      <select 
                        className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={selectedResumeId || ''}
                        onChange={(e) => setSelectedResumeId(parseInt(e.target.value, 10))}
                      >
                        {resumes.map((r: any) => (
                          <option key={r.id} value={r.id}>{r.title}</option>
                        ))}
                      </select>
                    </div>
                    {showApplyConfirm ? (
                      <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900 font-medium mb-3">Submit application to {job.company}?</p>
                        <div className="flex space-x-2">
                          <button 
                            className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            onClick={() => applyMutation.mutate()}
                            disabled={applyMutation.isPending}
                          >
                            {applyMutation.isPending ? 'Submitting...' : 'Confirm'}
                          </button>
                          <button 
                            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                            onClick={() => setShowApplyConfirm(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="w-full bg-gray-900 text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors"
                        onClick={() => setShowApplyConfirm(true)}
                        disabled={!selectedResumeId}
                      >
                        Apply Now
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600 mb-3">Create a resume before applying.</p>
                    <Link to="/career/resume">
                      <button className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition-colors">
                        Build Resume
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            <hr className="my-6 border-gray-100" />
            
            <div className="text-center">
              <h3 className="text-md font-bold text-gray-900 mb-4 flex justify-center items-center">
                <Sparkles className="w-4 h-4 mr-2 text-amber-500" /> AI Match Analysis
              </h3>
              
              {!matchData && !matchQuery.isFetching && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-4">See how well you're matched based on your resume and skills.</p>
                  <button 
                    className="w-full bg-white border border-blue-200 text-blue-700 py-2 rounded font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
                    onClick={handleAnalyzeMatch}
                    disabled={!selectedResumeId}
                  >
                    Analyze My Match
                  </button>
                </div>
              )}
              
              {(matchQuery.isFetching || refreshMatchMutation.isPending) && (
                <div className="py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500">Analyzing job fit...</p>
                </div>
              )}
              
              {matchData && !matchQuery.isFetching && !refreshMatchMutation.isPending && (
                <div className="bg-white rounded-xl">
                  <div className="flex justify-center mb-4">
                    <JobScoreRing score={matchData.match_score ?? matchData.deterministic_score ?? 0} size={140} />
                  </div>
                  
                  {matchData.is_stale && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 text-left">
                      <p className="text-xs text-amber-800 flex items-start">
                        <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                        <span>Your resume has changed since this analysis.</span>
                      </p>
                      <button 
                        className="mt-2 text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
                        onClick={() => refreshMatchMutation.mutate()}
                      >
                        Refresh Analysis
                      </button>
                    </div>
                  )}

                  {!matchData.ai_available && (
                     <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4 text-left">
                        <p className="text-xs text-gray-600 flex items-start">
                          <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                          <span>AI analysis is temporarily unavailable. Showing deterministic score.</span>
                        </p>
                     </div>
                  )}
                  
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center text-sm border-b pb-2">
                      <span className="text-gray-500">Objective Score</span>
                      <span className="font-semibold">{Math.round(matchData.deterministic_score || 0)}%</span>
                    </div>

                    {matchData.ai_available && matchData.role_alignment && (
                      <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <p className="text-xs text-gray-700 leading-relaxed italic">{matchData.role_alignment}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase mb-2 flex items-center">
                        <CheckCircle2 className="w-3 h-3 text-green-500 mr-1" /> Matched Skills
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {matchData.matched_skills.length > 0 ? (
                           matchData.matched_skills.map(s => (
                             <span key={s} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">{s}</span>
                           ))
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase mb-2 flex items-center">
                        <XCircle className="w-3 h-3 text-red-400 mr-1" /> Missing Skills
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {matchData.missing_skills.length > 0 ? (
                           matchData.missing_skills.map(s => (
                             <span key={s} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100">{s}</span>
                           ))
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
