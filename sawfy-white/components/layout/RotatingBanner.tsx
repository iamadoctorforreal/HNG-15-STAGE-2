'use client';

import React, { useState, useEffect } from 'react';

const MESSAGES = [
  {
    lang: 'English',
    flag: '🌍',
    text: 'Welcome! Export-grade premium dried catfish from Abeokuta to Nigeria, UK & USA',
  },
  {
    lang: 'Français',
    flag: '🇫🇷',
    text: "Bienvenue! Poisson-chat séché d'Abeokuta de qualité export expédié dans le monde entier",
  },
  {
    lang: 'Hausa',
    flag: '🇳🇬',
    text: 'Barka da zuwa! Kifin busasshe mai inganci daga Abeokuta zuwa gidajenku',
  },
  {
    lang: 'Yorùbá',
    flag: '🇳🇬',
    text: 'Ẹ kú àbọ̀! Ẹja àrọ̀ dídá tó dára jùlọ láti Abẹ́òkúta sí gbogbo àgbáyé',
  },
  {
    lang: 'Igbo',
    flag: '🇳🇬',
    text: 'Nnọọ! Azụ kpọrọ nkụ kacha mma si Abeokuta ruo tebụl gị',
  },
];

export function RotatingBanner() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // Rotate every 4s, stop automatically after 2 minutes (120,000ms)
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % MESSAGES.length);
        setFade(true);
      }, 350);
    }, 4000);

    const stopTimer = setTimeout(() => {
      clearInterval(interval);
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimer);
    };
  }, []);

  const current = MESSAGES[index];

  return (
    <div className="bg-[#004729] text-emerald-100 text-xs py-2 px-4 border-b border-emerald-800/80 shadow-xs relative z-50 overflow-hidden">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Subtle Water Stream Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 opacity-75 text-[11px] text-[#E8C468]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8C468] animate-pulse" />
          <span className="font-semibold uppercase tracking-wider">Abeokuta Fish Farms • Farm-Raised</span>
        </div>

        {/* Dynamic Rotating Message */}
        <div
          className={`flex-1 text-center font-medium transition-all duration-300 transform ${
            fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
          }`}
        >
          <span className="inline-block mr-2 px-1.5 py-0.5 rounded bg-emerald-900/80 border border-emerald-700/60 text-[10px] font-bold text-[#E8C468] uppercase tracking-wide">
            {current.lang}
          </span>
          <span className="text-white font-semibold">{current.text}</span>
        </div>

        {/* Indicator dots */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          {MESSAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setFade(false);
                setTimeout(() => {
                  setIndex(i);
                  setFade(true);
                }, 200);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                i === index ? 'bg-[#E8C468] w-4' : 'bg-emerald-700/80 hover:bg-emerald-600'
              }`}
              aria-label={`Switch to message ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
