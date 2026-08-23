import type { JobApplication } from '@/services/jobService';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Building, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ApplicationCardProps {
  application: JobApplication;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'bg-blue-50 text-blue-700 hover:bg-blue-100';
      case 'INTERVIEWING': return 'bg-amber-50 text-amber-700 hover:bg-amber-100';
      case 'OFFER': return 'bg-green-50 text-green-700 hover:bg-green-100';
      case 'REJECTED': return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <Card className="p-4 flex flex-col h-full hover:border-blue-200 transition-colors bg-white">
      <div className="mb-3">
        <h3 className="font-bold text-gray-900 leading-tight mb-1">{application.job.title}</h3>
        <div className="flex items-center text-gray-600 text-xs font-medium">
          <Building className="w-3 h-3 mr-1" />
          {application.job.company}
        </div>
      </div>

      <div className="flex-grow space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(application.applied_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center text-xs text-gray-500">
           <FileText className="w-3 h-3 mr-1" />
           Resume #{application.resume_id}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
        <Badge className={getStatusColor(application.status)}>
          {application.status.replace('_', ' ')}
        </Badge>
        
        <Link to={`/career/applications/${application.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
          View
        </Link>
      </div>
    </Card>
  );
}
