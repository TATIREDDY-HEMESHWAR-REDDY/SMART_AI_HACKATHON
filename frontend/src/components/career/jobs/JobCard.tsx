import React from 'react';
import type { Job } from '@/services/jobService';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Building, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: (jobId: number) => void;
  isSaving?: boolean;
}

export function JobCard({ job, isSaved = false, onToggleSave, isSaving = false }: JobCardProps) {
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleSave) onToggleSave(job.id);
  };

  return (
    <Card className="p-5 flex flex-col h-full hover:border-blue-200 transition-colors bg-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
          <div className="flex items-center text-gray-600 text-sm space-x-3">
            <span className="flex items-center">
              <Building className="w-4 h-4 mr-1 text-gray-400" />
              {job.company}
            </span>
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-gray-400" />
              {job.location}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-400" />
              {job.employment_type.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        {onToggleSave && (
          <button 
            onClick={handleSaveClick}
            disabled={isSaving}
            className="text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
            aria-label={isSaved ? "Unsave job" : "Save job"}
          >
            {isSaved ? <BookmarkCheck className="w-6 h-6 text-blue-600" /> : <Bookmark className="w-6 h-6" />}
          </button>
        )}
      </div>

      <div className="mb-6 flex-grow">
        <div className="flex flex-wrap gap-2 mt-3">
          {job.requirements.slice(0, 4).map((req, i) => (
            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
              {req}
            </Badge>
          ))}
          {job.requirements.length > 4 && (
            <Badge variant="outline" className="bg-gray-100 text-gray-600">
              +{job.requirements.length - 4} more
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
        <div className="text-xs text-gray-500">
          Posted {new Date(job.posted_at).toLocaleDateString()}
        </div>
        <div className="flex space-x-3">
          <Link to={`/career/jobs/${job.id}`}>
             <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors">
              View Details
             </button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
