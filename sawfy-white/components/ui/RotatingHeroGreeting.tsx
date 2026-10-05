'use client';

import React, { useState, useEffect } from 'react';

const HERO_GREETINGS = [
  { lang: 'English', text: 'Welcome! Export-Grade Dried Catfish from Abeokuta' },
  { lang: 'Français', text: 'Bienvenue! Poisson-Chat Séché d\'Abeokuta Qualité Export' },
  { lang: 'Hausa', text: 'Barka da zuwa! Kifin Busasshe Mai Inganci Daga Abeokuta' },
  { lang: 'Yorùbá', text: 'Ẹ kú àbọ̀! Ẹja Àrọ̀ Dídá Tó Dára Jùlọ Láti Abẹ́òkúta' },
  { lang: 'Igbo', text: 'Nnọọ! Azụ Kpọrọ Nkụ Kacha Mma Si Abeokuta' },
];

export function RotatingHeroGreeting() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % HERO_GREETINGS.length);
        setFade(true);
      }, 300);
    }, 4000);

    const stopTimer = setTimeout(() => {
      clearInterval(timer);
    }, 120000);

    return () => {
      clearInterval(timer);
      clearTimeout(stopTimer);
    };
  }, []);

  const current = HERO_GREETINGS[index];

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#008751]/10 text-[#006b3f] text-xs font-bold uppercase tracking-wider mb-4 border border-[#008751]/20">
      <span className="w-1.5 h-1.5 rounded-full bg-[#008751] animate-pulse" />
      <span className="text-[#D4A843] font-black text-[10px] bg-[#005230] px-1.5 py-0.5 rounded">
        {current.lang}
      </span>
      <span
        className={`transition-all duration-300 transform ${
          fade ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'
        }`}
      >
        {current.text}
      </span>
    </div>
  );
}
