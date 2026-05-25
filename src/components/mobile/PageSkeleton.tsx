export function PageSkeleton() {
  return (
    <div className="px-4 pt-6 pb-4 animate-pulse">
      <div className="h-7 w-40 rounded-lg bg-muted" />
      <div className="mt-2 h-4 w-56 rounded-lg bg-muted/70" />

      <div className="mt-6 space-y-3">
        <div className="h-24 rounded-lg bg-muted" />
        <div className="h-24 rounded-lg bg-muted" />
        <div className="h-24 rounded-lg bg-muted" />
        <div className="h-24 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
