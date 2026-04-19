import React from 'react';

interface SkeletonCardProps {
  variant?: 'car' | 'package';
}

export default function SkeletonCard({ variant = 'car' }: SkeletonCardProps) {
  if (variant === 'package') {
    return (
      <div className="card-dark rounded-2xl overflow-hidden animate-pulse">
        <div className="aspect-video shimmer" />
        <div className="p-6 space-y-4">
          <div className="h-6 shimmer rounded-lg w-3/4" />
          <div className="h-4 shimmer rounded-lg w-1/2" />
          <div className="space-y-2">
            <div className="h-3 shimmer rounded-lg w-full" />
            <div className="h-3 shimmer rounded-lg w-5/6" />
          </div>
          <div className="h-10 shimmer rounded-xl w-full mt-4" />
        </div>
      </div>
    );
  }

  // Car variant
  return (
    <div className="card-dark rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-5 shimmer rounded-lg w-3/4" />
        <div className="h-4 shimmer rounded-lg w-1/2" />
        <div className="flex gap-3 py-3">
          <div className="h-4 shimmer rounded-lg w-16" />
          <div className="h-4 shimmer rounded-lg w-20" />
          <div className="h-4 shimmer rounded-lg w-14" />
        </div>
        <div className="h-8 shimmer rounded-lg w-1/3" />
        <div className="h-10 shimmer rounded-xl w-full mt-2" />
      </div>
    </div>
  );
}
