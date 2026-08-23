import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-accent text-accent-foreground',
    success: 'bg-emerald-50 text-emerald-800',
    warning: 'bg-amber-50 text-amber-800',
    destructive: 'bg-red-50 text-red-800',
    outline: 'border border-border text-foreground/70',
  };

  return (
    <span
      className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide", variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
