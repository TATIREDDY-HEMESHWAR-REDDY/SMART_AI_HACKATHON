import { cn } from '@/lib/utils';

export function JobScoreRing({ 
  score, 
  size = 120, 
  strokeWidth = 10,
  className 
}: { 
  score: number | null, 
  size?: number, 
  strokeWidth?: number,
  className?: string
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = score !== null ? circumference - (score / 100) * circumference : circumference;
  
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-500';
    if (s >= 75) return 'text-blue-500';
    if (s >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getLabel = (s: number) => {
    if (s >= 90) return 'Excellent Match';
    if (s >= 75) return 'Strong Match';
    if (s >= 60) return 'Moderate Match';
    return 'Skill Gap';
  };
  
  return (
    <div className={cn("relative inline-flex flex-col items-center justify-center", className)}>
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            className="text-gray-100"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {score !== null && (
            <circle
              className={cn("transition-all duration-1000 ease-in-out", getColor(score))}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {score !== null ? (
            <>
              <span className="text-3xl font-bold text-gray-900">{Math.round(score)}%</span>
            </>
          ) : (
            <span className="text-sm font-medium text-gray-400 text-center px-4">No<br/>Match</span>
          )}
        </div>
      </div>
      {score !== null && (
        <span className={cn("mt-3 text-sm font-semibold", getColor(score))}>
          {getLabel(score)}
        </span>
      )}
    </div>
  );
}
