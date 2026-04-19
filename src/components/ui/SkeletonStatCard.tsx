import React from 'react';

export default function SkeletonStatCard() {
  return (
    <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6 overflow-hidden animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl shimmer flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 shimmer rounded-md w-1/2" />
          <div className="h-7 shimmer rounded-md w-1/3" />
        </div>
      </div>
    </div>
  );
}
