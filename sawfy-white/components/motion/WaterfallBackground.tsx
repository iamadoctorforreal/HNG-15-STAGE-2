'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

export function WaterfallBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Audio Engine: Realistic Waterfall Rushing Cascades & Water Splashes
  const toggleAudio = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;

      if (!audioContextRef.current) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(volume, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Layer 1: Waterfall roar (continuous rushing cascades)
        const bufferSize = ctx.sampleRate * 3;
        const waterfallBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = waterfallBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.03 * white) / 1.03;
          data[i] = lastOut * 3.5;
        }

        const waterfallSource = ctx.createBufferSource();
        waterfallSource.buffer = waterfallBuffer;
        waterfallSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, ctx.currentTime);
        filter.Q.setValueAtTime(1.8, ctx.currentTime);

        const cascadeGain = ctx.createGain();
        cascadeGain.gain.setValueAtTime(0.4, ctx.currentTime);

        waterfallSource.connect(filter);
        filter.connect(cascadeGain);
        cascadeGain.connect(masterGain);
        waterfallSource.start(0);

        // Layer 2: Whitewater splashes & foam
        const foamBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const foamData = foamBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          foamData[i] = (Math.random() * 2 - 1) * 0.12;
        }
        const foamSource = ctx.createBufferSource();
        foamSource.buffer = foamBuffer;
        foamSource.loop = true;

        const foamFilter = ctx.createBiquadFilter();
        foamFilter.type = 'bandpass';
        foamFilter.frequency.setValueAtTime(2200, ctx.currentTime);
        foamFilter.Q.setValueAtTime(2.2, ctx.currentTime);

        const foamGain = ctx.createGain();
        foamGain.gain.setValueAtTime(0.2, ctx.currentTime);

        foamSource.connect(foamFilter);
        foamFilter.connect(foamGain);
        foamGain.connect(masterGain);
        foamSource.start(0);

        setIsPlayingAudio(true);
      } else {
        if (audioContextRef.current.state === 'suspended' || !isPlayingAudio) {
          audioContextRef.current.resume();
          setIsPlayingAudio(true);
        } else {
          audioContextRef.current.suspend();
          setIsPlayingAudio(false);
        }
      }
    } catch (e) {
      console.error('Audio initialization error:', e);
    }
  }, [isPlayingAudio, volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(val, audioContextRef.current.currentTime);
    }
  };

  // Ensure video auto-plays reliably & loops continuously without cutting off
  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.play().catch(() => {
        // Handled if browser policies require user interaction
      });
    }
  }, []);

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    // Loop before the abrupt cutoff at the ending of the video
    if (vid.currentTime >= 6.0) {
      vid.currentTime = 0.1;
    }
  };

  return (
    <>
      {/* Page-Wide Fixed Photorealistic Waterfall Background (Vivid & Always Visible) */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden"
        style={{
          backgroundImage: "url('/images/Salmon_leaping_in_river_waterfall_2K_20261004103355.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Photorealistic Waterfall Video Layer */}
        <video
          ref={videoRef}
          src="/videos/waterfall-background.mp4"
          poster="/images/Salmon_leaping_in_river_waterfall_2K_20261004103355.jpg"
          autoPlay
          muted
          loop
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover object-center transition-opacity duration-1000"
        />

        {/* Subtle Dark/Mist Vignette so the vivid emerald waterfall pops behind content */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />
      </div>

      {/* Floating Waterfall Audio Player (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-[#D4A843] shadow-2xl flex items-center gap-3">
        <button
          onClick={toggleAudio}
          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-[#008751] text-white ring-2 ring-emerald-300'
              : 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
          }`}
          title="Toggle waterfall roar & river ambience sound"
        >
          <span>{isPlayingAudio ? '🔊' : '▶'}</span>
          <span>{isPlayingAudio ? 'Waterfall Sound: On' : 'Hear Waterfall Roar'}</span>
        </button>

        {isPlayingAudio && (
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 accent-[#008751] cursor-pointer"
              title="Volume"
            />
          </div>
        )}
      </div>
    </>
  );
}
