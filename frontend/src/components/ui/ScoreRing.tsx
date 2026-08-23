import { cn } from '@/lib/utils';

export function ScoreRing({ 
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
    if (s >= 80) return 'text-emerald-600';
    if (s >= 60) return 'text-amber-600';
    return 'text-red-500';
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-secondary"
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
            <span className="font-serif text-3xl font-semibold text-foreground">{Math.round(score)}%</span>
            <span className="text-xs text-muted-foreground">Readiness</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground text-center px-4">Not<br/>Assessed</span>
        )}
      </div>
    </div>
  );
}
