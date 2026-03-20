'use client';

import { useState } from 'react';

interface AvatarProps {
  name: string;
  headshotUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-xl',
  lg: 'w-24 h-24 text-3xl',
};

export default function Avatar({ name, headshotUrl, size = 'md' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeClass = sizeClasses[size];

  if (headshotUrl && !imgError) {
    return (
      <img
        src={headshotUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border-2 border-gray-200 flex-shrink-0`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
