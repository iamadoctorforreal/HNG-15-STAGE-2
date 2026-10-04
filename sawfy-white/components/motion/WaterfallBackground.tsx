'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

export function WaterfallBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [scrollPercent, setScrollPercent] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Track page scroll to pan down the waterfall to where the fishes are
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const ratio = Math.min(1, Math.max(0, scrollY / docHeight));
        setScrollPercent(ratio);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Video Autoplay and User Control
  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.muted = true;
      vid.defaultMuted = true;
      vid.playsInline = true;
      vid
        .play()
        .then(() => setIsVideoPlaying(true))
        .catch(() => {
          setIsVideoPlaying(false);
        });
    }

    // Attempt play on first user interaction if browser blocked autoplay
    const handleFirstTouch = () => {
      const v = videoRef.current;
      if (v && v.paused) {
        v.play()
          .then(() => setIsVideoPlaying(true))
          .catch(() => {});
      }
    };
    window.addEventListener('click', handleFirstTouch, { once: true });
    window.addEventListener('scroll', handleFirstTouch, { once: true, passive: true });

    return () => {
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('scroll', handleFirstTouch);
    };
  }, []);

  const toggleVideoPlayback = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setIsVideoPlaying(true));
    } else {
      vid.pause();
      setIsVideoPlaying(false);
    }
  };

  // Vertical position percentage as user scrolls (0% top waterfall -> 100% bottom river fishes)
  const verticalPosition = `${Math.round(scrollPercent * 100)}%`;

  return (
    <>
      {/* Page-Wide Fixed Waterfall Background that pans down as you scroll */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden"
        style={{
          backgroundImage: "url('/images/Salmon_leaping_in_river_waterfall_2K_20261004103355.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: `center ${verticalPosition}`,
          backgroundRepeat: 'no-repeat',
          transition: 'background-position 0.25s ease-out',
        }}
      >
        {/* Photorealistic Waterfall Video Layer that also pans down on scroll */}
        <video
          ref={videoRef}
          src="/videos/waterfall-background.mp4"
          poster="/images/Salmon_leaping_in_river_waterfall_2K_20261004103355.jpg"
          autoPlay
          muted
          loop
          playsInline
          style={{
            objectPosition: `center ${verticalPosition}`,
            transition: 'object-position 0.25s ease-out',
          }}
          className="w-full h-full object-cover"
        />

        {/* Soft Vignette Overlay so foreground cards and text are crisp */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />
      </div>

      {/* Floating Floating Waterfall Controls (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-[#D4A843] shadow-2xl flex items-center gap-2.5">
        {/* Video Play/Pause toggle */}
        <button
          onClick={toggleVideoPlayback}
          className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all cursor-pointer shadow-2xs border border-gray-300"
          title="Play or pause background waterfall video"
        >
          <span>{isVideoPlaying ? '⏸' : '▶'}</span>
          <span>{isVideoPlaying ? 'Video Playing' : 'Play Video'}</span>
        </button>

        {/* Waterfall Audio toggle */}
        <button
          onClick={toggleAudio}
          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-[#008751] text-white ring-2 ring-emerald-300'
              : 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
          }`}
          title="Toggle waterfall roar & river stream sound"
        >
          <span>{isPlayingAudio ? '🔊' : '▶'}</span>
          <span>{isPlayingAudio ? 'Sound: On' : 'Hear Roar'}</span>
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
              className="w-14 accent-[#008751] cursor-pointer"
              title="Volume"
            />
          </div>
        )}
      </div>
    </>
  );
}
