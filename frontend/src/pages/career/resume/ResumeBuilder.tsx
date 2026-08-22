import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, Copy, Trash2, Download, 
  Sparkles, Plus, Check
} from 'lucide-react';
import { resumeService } from '@/services/resumeService';
import { careerService } from '@/services/careerService';
import ResumePreview from './ResumePreview';
import ResumeForm from './ResumeForm';
import AnalysisView from './AnalysisView';


export default function ResumeBuilder() {
  const [activeResumeId, setActiveResumeId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'analyze'>('edit');
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();
  const toast = (msg: any) => alert(msg.title || msg);

  const { data: resumes = [], isLoading: isLoadingResumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeService.getResumes
  });

  const { data: activeResume, isLoading: isLoadingActive } = useQuery({
    queryKey: ['resume', activeResumeId],
    queryFn: () => resumeService.getResume(activeResumeId!),
    enabled: !!activeResumeId
  });

  const { data: careerProfile } = useQuery({
    queryKey: ['careerProfile'],
    queryFn: careerService.getProfile
  });

  useEffect(() => {
    if (resumes.length > 0 && !activeResumeId) {
      const defaultRes = resumes.find((r: any) => r.is_default) || resumes[0];
      setActiveResumeId(defaultRes.id);
    }
  }, [resumes, activeResumeId]);

  const createMutation = useMutation({
    mutationFn: resumeService.createResume,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setActiveResumeId(data.id);
      toast({ title: 'Resume created' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => resumeService.updateResume(activeResumeId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', activeResumeId] });
      toast({ title: 'Saved' });
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: resumeService.duplicateResume,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setActiveResumeId(data.id);
      toast({ title: 'Resume duplicated' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: resumeService.deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setActiveResumeId(null);
      toast({ title: 'Resume deleted' });
    }
  });

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 500);
  };

  const handleSyncFromProfile = () => {
    if (!careerProfile) return;
    
    updateMutation.mutate({
      ...activeResume,
      full_name: careerProfile.name || activeResume.full_name,
      summary: careerProfile.bio || activeResume.summary,
      skills: careerProfile.skills.map((s: any) => ({
        name: s.name,
        category: s.category || 'General',
        proficiency: 'Intermediate'
      }))
    });
  };

  if (isLoadingResumes) {
    return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 print:bg-white print:h-auto">
      {/* Top Header - Hide on print */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between print:hidden shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <FileText className="w-5 h-5" />
            <span>Resume Builder</span>
          </div>
          
          <div className="h-6 w-px bg-slate-200 mx-2" />
          
          <select 
            className="border-none bg-slate-50 text-slate-700 font-medium py-1 px-3 rounded-md focus:ring-0 cursor-pointer"
            value={activeResumeId || ''}
            onChange={(e) => setActiveResumeId(Number(e.target.value))}
          >
            {resumes.map((r: any) => (
              <option key={r.id} value={r.id}>{r.title} {r.is_default ? '(Default)' : ''}</option>
            ))}
          </select>
          
          <button 
            onClick={() => createMutation.mutate({ title: 'New Resume' })}
            className="text-slate-500 hover:text-primary p-1"
            title="Create New"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeResume && (
            <>
              {updateMutation.isPending && <span className="text-sm text-slate-500">Saving...</span>}
              {!updateMutation.isPending && <span className="text-sm text-slate-500 flex items-center gap-1"><Check className="w-4 h-4" /> Saved</span>}
              
              <button 
                onClick={() => duplicateMutation.mutate(activeResumeId!)}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" /> Duplicate
              </button>
              
              {resumes.length > 1 && (
                <button 
                  onClick={() => deleteMutation.mutate(activeResumeId!)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}

              <button 
                onClick={handleExport}
                className="px-4 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </>
          )}
        </div>
      </div>

      {!activeResume ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 print:hidden">
          <FileText className="w-16 h-16 mb-4 text-slate-300" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">No Resumes Found</h2>
          <p className="mb-6">Create your first resume to get started.</p>
          <button 
            onClick={() => createMutation.mutate({ title: 'My Resume', is_default: true })}
            className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90"
          >
            Create Resume
          </button>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden print:overflow-visible">
          {/* Left Panel - Editor/Analysis (Hide on print) */}
          <div className="w-[45%] flex flex-col border-r border-slate-200 bg-white print:hidden shrink-0">
            <div className="flex border-b border-slate-200">
              <button
                className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'edit' ? 'border-primary text-primary' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                onClick={() => setActiveTab('edit')}
              >
                Edit Resume
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 ${activeTab === 'analyze' ? 'border-primary text-primary' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                onClick={() => setActiveTab('analyze')}
              >
                <Sparkles className="w-4 h-4" /> AI Analysis
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 relative">
              {isLoadingActive ? (
                <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
              ) : activeTab === 'edit' ? (
                <>
                  <div className="mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <h3 className="text-sm font-medium text-slate-800">Auto-fill from Profile</h3>
                      <p className="text-xs text-slate-500 mt-1">Import your existing career data to save time.</p>
                    </div>
                    <button 
                      onClick={handleSyncFromProfile}
                      className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20"
                    >
                      Sync Data
                    </button>
                  </div>
                  <ResumeForm resume={activeResume} onSave={(data) => updateMutation.mutate(data)} />
                </>
              ) : (
                <AnalysisView resume={activeResume} />
              )}
            </div>
          </div>

          {/* Right Panel - Preview (Full width on print) */}
          <div className={`w-[55%] bg-slate-100 overflow-y-auto p-8 print:w-full print:p-0 print:bg-white print:overflow-visible ${isExporting ? 'print-mode' : ''}`}>
            <div className="max-w-[21cm] mx-auto min-h-[29.7cm] bg-white shadow-xl print:shadow-none print:max-w-none print:mx-0 print:min-h-0">
              <ResumePreview resume={activeResume} />
            </div>
          </div>
        </div>
      )}
      
      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:mx-0 {
            margin: 0 !important;
          }
          .print\\:overflow-visible {
            overflow: visible !important;
          }
          .print\\:h-auto {
            height: auto !important;
          }
          .print-mode, .print-mode * {
            visibility: visible;
          }
          .print-mode {
            position: absolute;
            left: 0;
            top: 0;
          }
          @page {
            margin: 0;
            size: A4 portrait;
          }
        }
      `}} />
    </div>
  );
}
