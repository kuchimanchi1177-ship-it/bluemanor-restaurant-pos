"use client";

import React from 'react';
import { FoodType } from '@/types';

interface FoodTypeBadgeProps {
  type?: FoodType | boolean;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function FoodTypeBadge({
  type = 'VEG',
  showLabel = false,
  size = 'sm',
  className = '',
}: FoodTypeBadgeProps) {
  const isVeg = type === 'VEG' || type === true;
  const label = isVeg ? 'VEG' : 'NON-VEG';
  const fullLabel = isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian';

  const dotSize =
    size === 'xs' ? 'w-1.5 h-1.5' : size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  const boxSize =
    size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center gap-1.5 shrink-0 ${className}`}
      title={fullLabel}
      aria-label={fullLabel}
    >
      <span
        className={`${boxSize} rounded-[3px] border flex items-center justify-center shrink-0 bg-white shadow-2xs ${
          isVeg ? 'border-emerald-600' : 'border-rose-600'
        }`}
      >
        <span
          className={`${dotSize} rounded-full ${
            isVeg ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        />
      </span>
      {showLabel && (
        <span
          className={`font-black tracking-wider text-[9px] uppercase px-1 py-0.5 rounded border leading-none ${
            isVeg
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : 'text-rose-700 bg-rose-50 border-rose-200'
          }`}
        >
          {label}
        </span>
      )}
    </span>
  );
}

export default FoodTypeBadge;
