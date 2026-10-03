'use client';

import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  light?: boolean;
}

export function BrandLogo({
  className = '',
  size = 'md',
  showText = true,
  light = false,
}: BrandLogoProps) {
  const sizeMap = {
    sm: { icon: 32, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 42, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 54, text: 'text-2xl', sub: 'text-xs' },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Abstract Sacred River & Golden Catfish Crest */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-2xl p-2 transition-transform duration-300 hover:scale-105"
        style={{
          width: sizeMap.icon,
          height: sizeMap.icon,
          background: light
            ? 'rgba(255, 255, 255, 0.12)'
            : 'linear-gradient(135deg, #005230 0%, #008751 60%, #006b3f 100%)',
          boxShadow: light
            ? '0 2px 10px rgba(0,0,0,0.2)'
            : '0 4px 14px rgba(0, 135, 81, 0.25)',
          border: light ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(212, 168, 67, 0.3)',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Subtle River Wave Current */}
          <path
            d="M15 72C28 62 42 78 56 68C68 60 76 66 85 58"
            stroke={light ? '#E8C468' : '#D4A843'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
          <path
            d="M20 82C32 74 46 86 58 78C70 70 78 74 85 68"
            stroke={light ? '#ffffff' : '#e6f5ed'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />

          {/* Abstract Golden Leaping Catfish Arc */}
          <path
            d="M26 58C28 36 44 20 66 22C74 23 80 27 82 32C80 37 72 40 64 38C52 35 40 44 38 56C37 60 33 62 26 58Z"
            fill="url(#goldGrad)"
          />

          {/* Catfish Whiskers (Fluid Stream Lines) */}
          <path
            d="M80 30C86 28 92 31 94 36"
            stroke="#FFF8E7"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M78 34C84 35 88 40 89 45"
            stroke="#D4A843"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Subtle Eye of Wisdom (Golden Pearl) */}
          <circle cx="72" cy="29" r="2.5" fill="#FFF8E7" />

          {/* Linear Gradient for Gold Ribbon */}
          <defs>
            <linearGradient id="goldGrad" x1="20" y1="20" x2="85" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFF8E7" />
              <stop offset="0.4" stopColor="#E8C468" />
              <stop offset="0.85" stopColor="#D4A843" />
              <stop offset="1" stopColor="#B8922E" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-black tracking-tight font-serif leading-none ${sizeMap.text} ${
              light ? 'text-white' : 'text-[#005230]'
            }`}
          >
            Sawfy White
          </span>
          <span
            className={`font-bold tracking-widest uppercase mt-0.5 ${sizeMap.sub} ${
              light ? 'text-[#E8C468]' : 'text-[#D4A843]'
            }`}
          >
            Enterprises • Abeokuta
          </span>
        </div>
      )}
    </div>
  );
}
