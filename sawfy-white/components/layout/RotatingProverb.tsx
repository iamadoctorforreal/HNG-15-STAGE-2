'use client';

import React, { useState, useEffect } from 'react';

interface ProverbItem {
  lang: string;
  flag: string;
  proverb: string;
  translation: string;
}

const PROVERBS: ProverbItem[] = [
  {
    lang: 'English',
    flag: '🌍',
    proverb: 'Though oceans lie between us and Olumo Rock, our dried catfish brings home to your table.',
    translation: 'Export-grade Abeokuta dried catfish delivered directly to your doorstep.',
  },
  {
    lang: 'Français',
    flag: '🇫🇷',
    proverb: "Même loin du rocher d'Olumo, notre poisson séché apporte la maison à votre table.",
    translation: "La véritable saveur traditionnelle d'Abeokuta servie chez vous.",
  },
  {
    lang: 'Hausa',
    flag: '🇳🇬',
    proverb: 'Idan ba za ka iya kasancewa a Olumo ba, busasshen kifinmu zai kawo gida teburinka.',
    translation: 'Wherever you reside, our dried fish brings the authentic taste of home.',
  },
  {
    lang: 'Yorùbá',
    flag: '🇳🇬',
    proverb: 'Bí o kò bá le wà ní Olúmọ, ẹja dídá wa yóò mú ilé wá sí tábìlì rẹ.',
    translation: 'If you cannot be at Olumo Rock, our dried catfish brings home to your table.',
  },
  {
    lang: 'Igbo',
    flag: '🇳🇬',
    proverb: 'Ọ bụrụ na ị pụghị ịnọ na Olumo, azụ kpọrọ nkụ anyị ga-ebute ụlọ na tebụl gị.',
    translation: 'Even across oceans, our dried fish delivers the warmth of our heritage.',
  },
];

export function RotatingProverb() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // Rotate every 5s, stop automatically after 2 minutes (120,000ms)
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % PROVERBS.length);
        setFade(true);
      }, 400);
    }, 5000);

    const stopTimer = setTimeout(() => {
      clearInterval(timer);
    }, 120000);

    return () => {
      clearInterval(timer);
      clearTimeout(stopTimer);
    };
  }, []);

  const current = PROVERBS[index];

  return (
    <div className="mt-4 pt-3 border-t border-gray-700/80">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2 h-2 rounded-full bg-[#E8C468] animate-ping" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#E8C468]">
          Voice of Abeokuta • {current.lang}
        </span>
      </div>

      <div
        className={`min-h-[50px] transition-all duration-400 transform ${
          fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        }`}
      >
        <p className="text-xs font-serif italic text-emerald-300 leading-relaxed">
          &ldquo;{current.proverb}&rdquo;
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          {current.translation}
        </p>
      </div>

      <div className="flex items-center gap-1.5 mt-2">
        {PROVERBS.map((p, i) => (
          <button
            key={p.lang}
            onClick={() => {
              setFade(false);
              setTimeout(() => {
                setIndex(i);
                setFade(true);
              }, 200);
            }}
            title={p.lang}
            className={`h-1 rounded-full transition-all cursor-pointer ${
              i === index ? 'w-6 bg-[#E8C468]' : 'w-2 bg-gray-600 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
