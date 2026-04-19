import React from 'react';

export default function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full bg-[#111118] border border-[#2a2a3a] rounded-2xl overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-[#1a1a24] border-b border-[#2a2a3a] px-6 py-4 flex gap-4">
        <div className="h-4 shimmer rounded-md w-1/4" />
        <div className="h-4 shimmer rounded-md w-1/4" />
        <div className="h-4 shimmer rounded-md w-1/4" />
        <div className="h-4 shimmer rounded-md w-1/4" />
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-[#2a2a3a]">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full shimmer flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 shimmer rounded-md w-1/3" />
              <div className="h-3 shimmer rounded-md w-1/4" />
            </div>
            <div className="w-24 h-6 shimmer rounded-full" />
            <div className="w-20 h-6 shimmer rounded-full" />
            <div className="flex gap-2">
              <div className="w-8 h-8 shimmer rounded-md" />
              <div className="w-8 h-8 shimmer rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
