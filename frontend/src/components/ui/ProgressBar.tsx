import { cn } from '@/lib/utils';

export function ProgressBar({
  progress,
  colorClass = "bg-primary",
  className
}: {
  progress: number,
  colorClass?: string,
  className?: string
}) {
  return (
    <div className={cn("w-full bg-secondary rounded-full h-1.5 overflow-hidden", className)}>
      <div
        className={cn("h-1.5 rounded-full transition-all duration-500 ease-in-out", colorClass)}
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      ></div>
    </div>
  );
}
