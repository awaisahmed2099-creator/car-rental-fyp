import React from 'react';

interface SkeletonCardProps {
  variant?: 'car' | 'package';
}

export default function SkeletonCard({ variant = 'car' }: SkeletonCardProps) {
  if (variant === 'package') {
    return (
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 animate-pulse h-80">
        <div className="h-8 bg-slate-600 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-slate-600 rounded w-1/2 mb-6"></div>
        <div className="space-y-3 mb-6">
          <div className="h-4 bg-slate-600 rounded w-full"></div>
          <div className="h-4 bg-slate-600 rounded w-5/6"></div>
        </div>
        <div className="h-10 bg-slate-600 rounded w-full"></div>
      </div>
    );
  }

  // Car variant
  return (
    <div className="bg-white rounded-xl overflow-hidden animate-pulse">
      <div className="bg-gray-300 aspect-video rounded-xl"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  );
}
