'use client';

import { getAvatarPalette } from '@/lib/mockData';

interface AvatarProps {
  id: string;
  name: string;
  photo?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  blocked?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-7 h-7 text-[10px] rounded-lg',
  sm: 'w-9 h-9 text-xs rounded-xl',
  md: 'w-11 h-11 text-sm rounded-xl',
  lg: 'w-14 h-14 text-base rounded-2xl',
  xl: 'w-20 h-20 text-xl rounded-3xl',
};

export function Avatar({ id, name, photo, size = 'md', blocked = false, className = '' }: AvatarProps) {
  const palette = getAvatarPalette(id);
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const sz = SIZE_MAP[size];

  if (photo) {
    return (
      <div className={`${sz} overflow-hidden flex-shrink-0 ${className}`}
        style={{ border: blocked ? '2px solid #ef4444' : `2px solid ${palette.accent}40` }}>
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${sz} flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
      style={{
        background: blocked ? 'linear-gradient(135deg,#7f1d1d,#450a0a)' : palette.bg,
        boxShadow: blocked ? 'none' : `0 0 12px ${palette.accent}40`,
        border: blocked ? '2px solid rgba(239,68,68,0.40)' : `2px solid ${palette.accent}30`,
      }}>
      {initials}
    </div>
  );
}
