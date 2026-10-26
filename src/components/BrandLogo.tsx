"use client";

import React from 'react';

interface BrandLogoProps {
  logoUrl?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  subtext?: string;
  className?: string;
}

export default function BrandLogo({
  logoUrl,
  name = 'BLUEMANOR',
  size = 'md',
  showText = false,
  textClassName = '',
  subtext = 'Restaurant POS',
  className = '',
}: BrandLogoProps) {
  const sizeMap = {
    sm: { box: 'w-7 h-7 text-xs rounded-lg', font: 'text-xs' },
    md: { box: 'w-9 h-9 text-sm rounded-xl', font: 'text-sm' },
    lg: { box: 'w-12 h-12 text-base rounded-xl', font: 'text-base' },
    xl: { box: 'w-16 h-16 text-xl rounded-2xl', font: 'text-xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const hasCustomImage = logoUrl && (logoUrl.startsWith('data:') || logoUrl.startsWith('http') || logoUrl.startsWith('/'));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Badge */}
      <div
        className={`${currentSize.box} shrink-0 bg-slate-900 text-white font-black tracking-wider flex items-center justify-center border border-slate-800 shadow-xs relative overflow-hidden select-none`}
        title={name}
      >
        {hasCustomImage ? (
          <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-linear-to-br from-slate-900 to-slate-800 text-white relative">
            <span className="font-extrabold tracking-tighter">BM</span>
            {/* Red accent dot */}
            <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-red-600" />
          </div>
        )}
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="min-w-0">
          <div className={`font-black text-slate-900 tracking-tight leading-none uppercase ${textClassName || currentSize.font}`}>
            {name}
          </div>
          {subtext && (
            <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5 truncate">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
