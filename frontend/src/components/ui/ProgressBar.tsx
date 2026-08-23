import { cn } from '@/lib/utils';

export function ProgressBar({ 
  progress, 
  colorClass = "bg-blue-600",
  className 
}: { 
  progress: number, 
  colorClass?: string,
  className?: string
}) {
  return (
    <div className={cn("w-full bg-gray-100 rounded-full h-2.5 overflow-hidden", className)}>
      <div 
        className={cn("h-2.5 rounded-full transition-all duration-500 ease-in-out", colorClass)} 
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      ></div>
    </div>
  );
}
