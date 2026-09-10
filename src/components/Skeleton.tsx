import React from "react";

// Base pulsing placeholder block. Compose these into shapes that mimic the real content layout
// (a stat card, a table row, a form field) so the page doesn't flash from blank -> content with
// no in-between, and a slightly slow API call still reads as "working" rather than "broken".
export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`} />
);

// Mimics a row of KPI/stat cards (used by Subscriptions & Revenue, and similar dashboard-style
// panels) so the loading state has the same silhouette as the real 4-card grid.
export const SkeletonStatCards: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
    ))}
  </div>
);

// Mimics a data table -- a header bar plus a handful of row-shaped bars.
export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <div className="p-4 border-b border-slate-100">
      <Skeleton className="h-4 w-40" />
    </div>
    <div className="divide-y divide-slate-50">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  </div>
);

// Mimics a stacked form (label + input pairs) -- used by settings-style panels.
export const SkeletonForm: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
);
