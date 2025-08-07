import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl animate-pulse">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-700/50" />
      </div>
      <div className="space-y-1 sm:space-y-2">
        <div className="h-3 bg-slate-700/50 rounded w-24" />
        <div className="h-8 bg-slate-700/50 rounded w-16" />
        <div className="h-3 bg-slate-700/50 rounded w-20" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-700/50" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-700/50 rounded w-32" />
          <div className="h-3 bg-slate-700/50 rounded w-40" />
        </div>
      </div>
      <div className="h-64 sm:h-80 bg-slate-700/30 rounded" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="pt-24">
        <main className="flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8 h-full overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
              {/* Summary Stats Skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
              
              {/* Charts Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <ChartSkeleton />
                <ChartSkeleton />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
