import { useState, useEffect } from 'react';
import type { ResumeData } from '@/services/resumeService';
import { Plus, Trash2, ChevronDown, ChevronRight, LayoutTemplate } from 'lucide-react';

interface ResumeFormProps {
  resume: ResumeData;
  onSave: (data: any) => void;
}

export default function ResumeForm({ resume, onSave }: ResumeFormProps) {
  const [formData, setFormData] = useState<ResumeData>(resume);
  const [openSection, setOpenSection] = useState<string>('personal');

  // Basic autosave debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Avoid saving if unchanged
      if (JSON.stringify(resume) !== JSON.stringify(formData)) {
        onSave(formData);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [formData]);

  useEffect(() => {
    setFormData(resume);
  }, [resume.id]); // only re-sync on full resume change

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof ResumeData, index: number, key: string, value: any) => {
    const newArray = [...(formData[field] as any[])];
    newArray[index] = { ...newArray[index], [key]: value };
    handleChange(field as string, newArray);
  };

  const addArrayItem = (field: keyof ResumeData, templateItem: any) => {
    const current = formData[field] as any[] || [];
    handleChange(field as string, [...current, templateItem]);
  };

  const removeArrayItem = (field: keyof ResumeData, index: number) => {
    const newArray = [...(formData[field] as any[])];
    newArray.splice(index, 1);
    handleChange(field as string, newArray);
  };

  const handleListChange = (field: keyof ResumeData, index: number, listKey: string, text: string) => {
    // split by newlines for achievements
    const items = text.split('\\n').map(s => s.trim()).filter(s => s);
    handleArrayChange(field, index, listKey, items);
  };

  const SectionHeader = ({ id, title }: { id: string, title: string }) => (
    <div 
      className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm cursor-pointer hover:border-primary transition-colors"
      onClick={() => setOpenSection(openSection === id ? '' : id)}
    >
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {openSection === id ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <LayoutTemplate className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-slate-800">Template & Basics</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Resume Title</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary"
              value={formData.title || ''} 
              onChange={e => handleChange('title', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Template Style</label>
            <select 
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary"
              value={formData.template || 'modern'} 
              onChange={e => handleChange('template', e.target.value)}
            >
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
              <option value="technical">Technical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="space-y-2">
        <SectionHeader id="personal" title="Personal Information" />
        {openSection === 'personal' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
              <input type="text" className="w-full px-3 py-2 border rounded-md text-sm" value={formData.full_name || ''} onChange={e => handleChange('full_name', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input type="email" className="w-full px-3 py-2 border rounded-md text-sm" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input type="text" className="w-full px-3 py-2 border rounded-md text-sm" value={formData.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
              <input type="text" className="w-full px-3 py-2 border rounded-md text-sm" value={formData.location || ''} onChange={e => handleChange('location', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">LinkedIn</label>
              <input type="text" className="w-full px-3 py-2 border rounded-md text-sm" value={formData.linkedin || ''} onChange={e => handleChange('linkedin', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">GitHub</label>
              <input type="text" className="w-full px-3 py-2 border rounded-md text-sm" value={formData.github || ''} onChange={e => handleChange('github', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Portfolio/Website</label>
              <input type="text" className="w-full px-3 py-2 border rounded-md text-sm" value={formData.portfolio || ''} onChange={e => handleChange('portfolio', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Professional Summary</label>
              <textarea rows={4} className="w-full px-3 py-2 border rounded-md text-sm" value={formData.summary || ''} onChange={e => handleChange('summary', e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <SectionHeader id="experience" title="Experience" />
        {openSection === 'experience' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
            {formData.experiences?.map((exp: any, i: number) => (
              <div key={i} className="p-4 bg-white border border-slate-200 rounded-md relative group">
                <button onClick={() => removeArrayItem('experiences', i)} className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Company</label>
                    <input type="text" className="w-full px-2 py-1.5 border rounded text-sm" value={exp.company || ''} onChange={e => handleArrayChange('experiences', i, 'company', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                    <input type="text" className="w-full px-2 py-1.5 border rounded text-sm" value={exp.role || ''} onChange={e => handleArrayChange('experiences', i, 'role', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                    <input type="text" placeholder="e.g. Jun 2022" className="w-full px-2 py-1.5 border rounded text-sm" value={exp.start_date || ''} onChange={e => handleArrayChange('experiences', i, 'start_date', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                    <input type="text" placeholder="e.g. Present" className="w-full px-2 py-1.5 border rounded text-sm" value={exp.end_date || ''} onChange={e => handleArrayChange('experiences', i, 'end_date', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Achievements (One per line)</label>
                    <textarea 
                      rows={3} 
                      className="w-full px-2 py-1.5 border rounded text-sm" 
                      value={(exp.achievements || []).join('\\n')} 
                      onChange={e => handleListChange('experiences', i, 'achievements', e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={() => addArrayItem('experiences', { company: '', role: '', start_date: '', end_date: '', is_current: false, description: '', achievements: [] })}
              className="w-full py-2 border-2 border-dashed border-slate-300 rounded-md text-sm text-slate-600 font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Experience
            </button>
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="space-y-2">
        <SectionHeader id="projects" title="Projects" />
        {openSection === 'projects' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
            {formData.projects?.map((proj: any, i: number) => (
              <div key={i} className="p-4 bg-white border border-slate-200 rounded-md relative group">
                <button onClick={() => removeArrayItem('projects', i)} className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Project Name</label>
                    <input type="text" className="w-full px-2 py-1.5 border rounded text-sm" value={proj.name || ''} onChange={e => handleArrayChange('projects', i, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Technologies (Comma separated)</label>
                    <input type="text" className="w-full px-2 py-1.5 border rounded text-sm" value={(proj.technologies || []).join(', ')} onChange={e => handleArrayChange('projects', i, 'technologies', e.target.value.split(',').map((s:string) => s.trim()).filter(Boolean))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Dates</label>
                    <input type="text" className="w-full px-2 py-1.5 border rounded text-sm" value={proj.start_date || ''} onChange={e => handleArrayChange('projects', i, 'start_date', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Key Features/Achievements (One per line)</label>
                    <textarea 
                      rows={3} 
                      className="w-full px-2 py-1.5 border rounded text-sm" 
                      value={(proj.achievements || []).join('\\n')} 
                      onChange={e => handleListChange('projects', i, 'achievements', e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={() => addArrayItem('projects', { name: '', description: '', technologies: [], achievements: [] })}
              className="w-full py-2 border-2 border-dashed border-slate-300 rounded-md text-sm text-slate-600 font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>
        )}
      </div>

      {/* Education */}
      <div className="space-y-2">
        <SectionHeader id="education" title="Education" />
        {openSection === 'education' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
            {formData.educations?.map((edu: any, i: number) => (
              <div key={i} className="p-4 bg-white border border-slate-200 rounded-md relative group">
                <button onClick={() => removeArrayItem('educations', i)} className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Institution</label>
                    <input type="text" className="w-full px-2 py-1.5 border rounded text-sm" value={edu.institution || ''} onChange={e => handleArrayChange('educations', i, 'institution', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Degree</label>
                    <input type="text" className="w-full px-2 py-1.5 border rounded text-sm" value={edu.degree || ''} onChange={e => handleArrayChange('educations', i, 'degree', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Field of Study</label>
                    <input type="text" className="w-full px-2 py-1.5 border rounded text-sm" value={edu.field || ''} onChange={e => handleArrayChange('educations', i, 'field', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                    <input type="text" className="w-full px-2 py-1.5 border rounded text-sm" value={edu.start_date || ''} onChange={e => handleArrayChange('educations', i, 'start_date', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                    <input type="text" className="w-full px-2 py-1.5 border rounded text-sm" value={edu.end_date || ''} onChange={e => handleArrayChange('educations', i, 'end_date', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={() => addArrayItem('educations', { institution: '', degree: '', field: '', start_date: '', end_date: '' })}
              className="w-full py-2 border-2 border-dashed border-slate-300 rounded-md text-sm text-slate-600 font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Education
            </button>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <SectionHeader id="skills" title="Skills" />
        {openSection === 'skills' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
            {formData.skills?.map((skill: any, i: number) => (
              <div key={i} className="flex gap-3 relative group items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <input type="text" placeholder="e.g. Languages" className="w-full px-2 py-1.5 border rounded text-sm" value={skill.category || ''} onChange={e => handleArrayChange('skills', i, 'category', e.target.value)} />
                </div>
                <div className="flex-[2]">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Skills (comma separated)</label>
                  <input type="text" className="w-full px-2 py-1.5 border rounded text-sm" value={skill.name || ''} onChange={e => handleArrayChange('skills', i, 'name', e.target.value)} />
                </div>
                <button onClick={() => removeArrayItem('skills', i)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button 
              onClick={() => addArrayItem('skills', { category: 'Core', name: '', proficiency: 'Intermediate' })}
              className="w-full py-2 border-2 border-dashed border-slate-300 rounded-md text-sm text-slate-600 font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Skill Category
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
}
