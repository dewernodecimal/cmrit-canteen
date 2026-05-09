interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="glass rounded-[var(--radius-card)] overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-24 rounded-[var(--radius-button)]" />
        </div>
      </div>
    </div>
  );
}
