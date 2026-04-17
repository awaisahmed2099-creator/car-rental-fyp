import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionTitle({
  title,
  subtitle,
  centered = true,
  light = false
}: SectionTitleProps) {
  return (
    <div className={`${centered ? 'text-center' : ''} mb-12`}>
      <h2 className={`text-4xl md:text-5xl font-bold tracking-tight ${
        light ? 'text-white' : 'text-slate-900'
      } mb-4`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg ${
          light ? 'text-gray-300' : 'text-gray-600'
        } max-w-2xl ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
