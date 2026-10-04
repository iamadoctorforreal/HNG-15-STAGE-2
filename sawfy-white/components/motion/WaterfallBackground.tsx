'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

export function WaterfallBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Audio Engine: Continuous rushing waterfall + splashing stream
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

        // Cascade brown-noise generator
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
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(1.8, ctx.currentTime);

        const cascadeGain = ctx.createGain();
        cascadeGain.gain.setValueAtTime(0.4, ctx.currentTime);

        waterfallSource.connect(filter);
        filter.connect(cascadeGain);
        cascadeGain.connect(masterGain);
        waterfallSource.start(0);

        // Foam splash high-frequency texture
        const foamBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const foamData = foamBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          foamData[i] = (Math.random() * 2 - 1) * 0.15;
        }
        const foamSource = ctx.createBufferSource();
        foamSource.buffer = foamBuffer;
        foamSource.loop = true;

        const foamFilter = ctx.createBiquadFilter();
        foamFilter.type = 'bandpass';
        foamFilter.frequency.setValueAtTime(2400, ctx.currentTime);
        foamFilter.Q.setValueAtTime(2.5, ctx.currentTime);

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

  // Video loop handling: loop the continuous flowing section (0s to 5.8s)
  // to avoid the abrupt cutoff at the ending of the video.
  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.currentTime >= 5.8) {
      vid.currentTime = 0.1;
    }
  };

  // Canvas animation for seamless continuous water shimmer, mist, and interactive catfish
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Interactive catfish model
    interface Catfish {
      x: number;
      y: number;
      startX: number;
      startY: number;
      t: number;
      duration: number;
      peakHeight: number;
      distance: number;
      direction: number;
      scale: number;
    }

    const activeFishes: Catfish[] = [];

    interface Ripple {
      x: number;
      y: number;
      radius: number;
      alpha: number;
    }
    const waterRipples: Ripple[] = [];

    const spawnFishAt = (targetX: number, targetY: number) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      activeFishes.push({
        x: targetX,
        y: targetY,
        startX: targetX - direction * 60,
        startY: Math.min(Math.max(targetY, height * 0.35), height * 0.85),
        t: 0,
        duration: 90 + Math.floor(Math.random() * 40),
        peakHeight: 90 + Math.random() * 70,
        distance: 190 + Math.random() * 110,
        direction,
        scale: 0.95 + Math.random() * 0.45,
      });

      waterRipples.push({
        x: targetX,
        y: targetY,
        radius: 8,
        alpha: 0.9,
      });
    };

    // Track mouse movement across page to trigger leaping fish in currents
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.75 && activeFishes.length < 5) {
        spawnFishAt(e.clientX, e.clientY);
      }
    };

    // Track scroll events across page to spawn fish emerging from water
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY);
      if (scrollDiff > 45 && Math.random() > 0.5 && activeFishes.length < 5) {
        const randomX = Math.random() * width;
        const randomY = Math.random() * (height * 0.6) + height * 0.3;
        spawnFishAt(randomX, randomY);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Water mist particles
    interface FoamParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }
    const foamParticles: FoamParticle[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: height * 0.3 + Math.random() * (height * 0.7),
      vx: (Math.random() - 0.5) * 1.6,
      vy: Math.random() * 1.5 + 0.8,
      size: Math.random() * 3 + 1.5,
      alpha: Math.random() * 0.4 + 0.2,
    }));

    let autoFishCountdown = 90;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Water mist particles drifting downward with the cascade
      for (const p of foamParticles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > height) {
          p.y = height * 0.2;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Water splash ripples
      for (let i = waterRipples.length - 1; i >= 0; i--) {
        const r = waterRipples[i];
        r.radius += 1.4;
        r.alpha -= 0.016;

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius * 1.8, r.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, r.alpha)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        if (r.alpha <= 0) {
          waterRipples.splice(i, 1);
        }
      }

      // Render periodic/interactive leaping African Catfish
      for (let i = activeFishes.length - 1; i >= 0; i--) {
        const fish = activeFishes[i];
        fish.t += 1;
        const progress = fish.t / fish.duration;

        if (progress >= 1) {
          waterRipples.push({
            x: fish.startX + fish.direction * fish.distance,
            y: fish.startY,
            radius: 10,
            alpha: 0.85,
          });
          activeFishes.splice(i, 1);
          continue;
        }

        const currentX = fish.startX + fish.direction * fish.distance * progress;
        const arcY = -Math.sin(progress * Math.PI) * fish.peakHeight;
        const currentY = fish.startY + arcY;

        ctx.save();
        ctx.translate(currentX, currentY);

        const dy = -Math.cos(progress * Math.PI) * fish.peakHeight * (Math.PI / fish.duration);
        const dx = (fish.direction * fish.distance) / fish.duration;
        let angle = Math.atan2(dy, dx);
        if (fish.direction === -1) {
          ctx.scale(-1, 1);
          angle = -angle;
        }
        ctx.rotate(angle);
        ctx.scale(fish.scale, fish.scale);

        // Catfish body (African Clarias gariepinus silhouette)
        const fishGrad = ctx.createLinearGradient(-35, 0, 35, 0);
        fishGrad.addColorStop(0, '#1E2328');
        fishGrad.addColorStop(0.5, '#423B28');
        fishGrad.addColorStop(0.8, '#D4A843');
        fishGrad.addColorStop(1, '#0F1215');

        ctx.fillStyle = fishGrad;
        ctx.beginPath();
        ctx.moveTo(32, 0);
        ctx.quadraticCurveTo(15, -11, -15, -8);
        ctx.quadraticCurveTo(-28, -5, -36, 0);
        ctx.quadraticCurveTo(-28, 5, -15, 8);
        ctx.quadraticCurveTo(15, 11, 32, 0);
        ctx.fill();

        // Broad dorsal fin
        ctx.fillStyle = 'rgba(212, 168, 67, 0.7)';
        ctx.beginPath();
        ctx.moveTo(-10, -8);
        ctx.quadraticCurveTo(-22, -15, -28, -5);
        ctx.lineTo(-24, -4);
        ctx.fill();

        // Rounded tail fin
        ctx.fillStyle = 'rgba(232, 196, 104, 0.85)';
        ctx.beginPath();
        ctx.moveTo(-36, 0);
        ctx.quadraticCurveTo(-46, -10, -48, 0);
        ctx.quadraticCurveTo(-46, 10, -36, 0);
        ctx.fill();

        // Barbels / Whiskers
        ctx.strokeStyle = '#D4A843';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(28, 2);
        ctx.quadraticCurveTo(38, 8, 44, 14);
        ctx.moveTo(28, -2);
        ctx.quadraticCurveTo(38, -8, 44, -14);
        ctx.stroke();

        ctx.restore();
      }

      // Interval spawn: natural leaping fish surfacing from the stream every few seconds
      autoFishCountdown--;
      if (autoFishCountdown <= 0) {
        autoFishCountdown = 160 + Math.floor(Math.random() * 120);
        if (activeFishes.length < 4) {
          const spawnX = Math.random() * (width * 0.75) + width * 0.12;
          const spawnY = Math.random() * (height * 0.5) + height * 0.35;
          spawnFishAt(spawnX, spawnY);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Fixed Page-Wide Waterfall Background */}
      <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none select-none">
        {/* Photorealistic Waterfall Video (Cascading continuously) */}
        <video
          ref={videoRef}
          src="/videos/waterfall-background.mp4"
          autoPlay
          muted
          loop
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover object-center opacity-40 brightness-95 contrast-105"
        />

        {/* Soft atmospheric gradient overlay for readability and color grading */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/80 via-[#FAF8F5]/65 to-[#FAF8F5]/85" />

        {/* Dynamic canvas with continuous mist & interactive leaping catfish */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-90" />
      </div>

      {/* Floating Audio & Stream Sound Control Widget (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-[#D4A843] shadow-xl flex items-center gap-3">
        <button
          onClick={toggleAudio}
          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-[#008751] text-white ring-2 ring-emerald-300'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
          title="Toggle waterfall & river ambience sound"
        >
          <span>{isPlayingAudio ? '🔊' : '▶'}</span>
          <span>{isPlayingAudio ? 'Waterfall Audio: On' : 'Hear Waterfall Sound'}</span>
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
