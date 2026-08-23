import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ResumeData } from "@/services/resumeService";
import { resumeService } from '@/services/resumeService';
import { Sparkles, AlertTriangle, CheckCircle, Briefcase } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface AnalysisViewProps {
  resume: ResumeData;
}

export default function AnalysisView({ resume }: AnalysisViewProps) {
  const queryClient = useQueryClient();
  const [jobDesc, setJobDesc] = useState('');

  const analyzeMutation = useMutation({
    mutationFn: () => resumeService.analyzeResume(resume.id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resume.id] });
      toast('Analysis Complete');
    }
  });

  const matchMutation = useMutation({
    mutationFn: () => resumeService.matchJob(resume.id!, jobDesc, 'Target Role'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resume.id] });
      toast('Job Match Complete');
    }
  });

  const latestAnalysis = resume.analyses && resume.analyses.length > 0 
    ? resume.analyses[resume.analyses.length - 1] 
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-blue-50 border border-primary/20 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> 
              AI Resume Analyzer
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-md">
              Get an instant ATS compatibility score and actionable feedback to improve your resume before applying.
            </p>
          </div>
          <button 
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {analyzeMutation.isPending ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {latestAnalysis && (
        <div className="space-y-6">
          {/* Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <div className="text-sm font-medium text-slate-500 mb-2">Overall Score</div>
              <div className="text-4xl font-bold text-primary">{Math.round(latestAnalysis.overall_score)}<span className="text-lg text-slate-400">/100</span></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <div className="text-sm font-medium text-slate-500 mb-2">ATS Compatibility</div>
              <div className="text-4xl font-bold text-slate-800">{Math.round(latestAnalysis.ats_score)}<span className="text-lg text-slate-400">/100</span></div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Quality Breakdown</h3>
            <div className="space-y-3">
              <ScoreBar label="Content Quality" score={latestAnalysis.content_quality} />
              <ScoreBar label="Experience" score={latestAnalysis.experience_quality} />
              <ScoreBar label="Projects" score={latestAnalysis.project_quality} />
              <ScoreBar label="Skills" score={latestAnalysis.skills_strength} />
              <ScoreBar label="Education" score={latestAnalysis.education_completeness} />
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">AI Feedback</h3>
            
            {latestAnalysis.strengths && latestAnalysis.strengths.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-emerald-700 flex items-center gap-1.5 mb-2">
                  <CheckCircle className="w-4 h-4" /> Strengths
                </h4>
                <ul className="space-y-1">
                  {latestAnalysis.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {latestAnalysis.actionable_improvements && latestAnalysis.actionable_improvements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-amber-700 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4" /> Recommendations
                </h4>
                <ul className="space-y-1">
                  {latestAnalysis.actionable_improvements.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Job Match */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-slate-600" />
              Target Job Match
            </h3>
            <p className="text-sm text-slate-500 mb-4">Paste a job description to see how well your resume matches.</p>
            
            <textarea 
              rows={4} 
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm mb-3 focus:ring-primary"
              placeholder="Paste job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
            
            <button 
              onClick={() => matchMutation.mutate()}
              disabled={!jobDesc || matchMutation.isPending}
              className="w-full py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              {matchMutation.isPending ? 'Matching...' : 'Analyze Match'}
            </button>

            {latestAnalysis.job_match_score !== null && latestAnalysis.job_match_score !== undefined && (
              <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-slate-700">Match Score</span>
                  <span className="text-2xl font-bold text-primary">{Math.round(latestAnalysis.job_match_score)}%</span>
                </div>
                
                {latestAnalysis.missing_skills && latestAnalysis.missing_skills.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Missing Skills</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {latestAnalysis.missing_skills.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded border border-red-100">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string, score: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
        <span>{label}</span>
        <span>{Math.round(score)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-1000" 
          style={{ width: `${score}%` }} 
        />
      </div>
    </div>
  );
}
