import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
  label?: string;
}

export default function SectionTitle({
  title,
  subtitle,
  centered = true,
  light = false,
  label,
}: SectionTitleProps) {
  return (
    <div className={`${centered ? 'text-center' : ''} mb-14`}>
      {/* Label */}
      {label && (
        <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-3">
          {label}
        </p>
      )}

      {/* Title */}
      <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight ${
        light ? 'text-white' : 'text-white'
      } mb-4`}>
        {title}
      </h2>

      {/* Accent bar */}
      <div className={`flex ${centered ? 'justify-center' : ''} mb-5`}>
        <div className="w-12 h-1 bg-orange-500 rounded-full" />
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className={`text-base md:text-lg ${
          light ? 'text-gray-400' : 'text-gray-400'
        } max-w-2xl ${centered ? 'mx-auto' : ''} leading-relaxed`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
