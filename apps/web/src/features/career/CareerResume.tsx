import React, { useState, useEffect } from 'react';
import { RoleGuard } from '@campus-os/ui';
import { Upload, FileText, Activity, AlertCircle, CheckCircle, Brain, RefreshCw } from 'lucide-react';

export const CareerResume = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [fileInput, setFileInput] = useState<string>('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRoles = user?.roles || [];

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/career/resume/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      if (result.success) {
        setResumes(result.data.resumes);
      } else {
        setError(result.error?.message || 'Failed to fetch resumes');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInput) return;
    try {
      setUploading(true);
      setError(null);
      const response = await fetch('http://localhost:3000/api/v1/career/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fileName: fileInput.split('\\').pop()?.split('/').pop() || 'resume.pdf' })
      });
      const result = await response.json();
      if (result.success) {
        setFileInput('');
        fetchResumes();
      } else {
        setError(result.error?.message || 'Failed to upload');
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (id: string) => {
    try {
      setAnalyzing(id);
      setError(null);
      const response = await fetch(`http://localhost:3000/api/v1/career/resume/${id}/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      if (result.success) {
        fetchResumes();
      } else {
        setError(result.error?.message || 'Failed to analyze');
      }
    } catch (err) {
      setError('Analysis failed');
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <RoleGuard allowedRoles={['STUDENT']} userRoles={userRoles}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Resume Management & AI Analysis</h2>
            <p className="text-gray-500">Upload your resume and get instant ATS feedback.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <form onSubmit={handleUpload} className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <span>Upload Resume</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select File (Mock)</label>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    value={fileInput}
                    onChange={(e) => setFileInput(e.target.value)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={uploading || !fileInput}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{uploading ? 'Uploading...' : 'Upload to Cloud'}</span>
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">Storage abstraction enabled. File will be securely mocked.</p>
              </div>
            </form>
          </div>

          <div className="md:col-span-2 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-indigo-600" /></div>
            ) : resumes.length === 0 ? (
              <div className="bg-gray-50 border border-dashed rounded-xl p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Resumes Found</h3>
                <p className="text-gray-500">Upload your first resume to get started.</p>
              </div>
            ) : (
              resumes.map(resume => (
                <div key={resume.id} className="bg-white border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-5">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <a href={resume.fileUrl} target="_blank" rel="noreferrer" className="font-bold text-lg text-indigo-900 hover:underline break-all">
                        {resume.fileUrl.split('/').pop()}
                      </a>
                      {resume.isPrimary && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold">Primary</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Uploaded: {new Date(resume.createdAt).toLocaleString()}</p>
                    
                    {!resume.analysis ? (
                      <button 
                        onClick={() => handleAnalyze(resume.id)}
                        disabled={analyzing === resume.id}
                        className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        {analyzing === resume.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                        <span>{analyzing === resume.id ? 'Analyzing...' : 'Run ATS AI Analysis'}</span>
                      </button>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg border mt-2">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-gray-700 flex items-center space-x-1"><Brain className="w-4 h-4 text-indigo-500"/> <span>AI ATS Feedback</span></h4>
                          <span className={`font-bold text-lg ${resume.analysis.atsScore > 80 ? 'text-green-600' : 'text-orange-600'}`}>
                            {resume.analysis.atsScore}/100
                          </span>
                        </div>
                        
                        {resume.analysis.feedback.summary && (
                          <p className="text-sm text-gray-600 italic mb-4 border-l-2 border-indigo-300 pl-3">
                            "{resume.analysis.feedback.summary}"
                          </p>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <h5 className="font-semibold text-green-700 mb-1">ATS Keywords</h5>
                            <p className="text-gray-600 flex items-start space-x-1">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                              <span>{resume.analysis.feedback.atsKeywordMatch || 'Optimized'}</span>
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-blue-700 mb-1">Job-Specific Tips</h5>
                            <ul className="space-y-1">
                              {resume.analysis.feedback.jobSpecificImprovements?.map((s: string, i: number) => (
                                <li key={i} className="flex items-start space-x-1">
                                  <Activity className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                                  <span className="text-gray-600">{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-sm">
                          <div className="bg-white p-3 rounded border">
                            <h5 className="font-semibold text-indigo-700 mb-2">Project Bullet Suggestions</h5>
                            <ul className="space-y-2">
                              {resume.analysis.feedback.projectBulletSuggestions?.map((s: string, i: number) => (
                                <li key={i} className="flex items-start space-x-2 text-gray-700">
                                  <span className="text-indigo-400 font-bold">•</span>
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};
