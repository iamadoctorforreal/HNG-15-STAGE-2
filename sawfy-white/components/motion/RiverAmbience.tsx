'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

export function RiverAmbience() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  // High-Fidelity Multi-Layered Waterfall & Splashing Stream Audio Engine
  const toggleAudio = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;

      if (!audioContextRef.current) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Master Gain
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(volume, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Layer 1: Deep Waterfall Cascade (Continuous Brown Noise Stream)
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

        // Resonant cascade bandpass filter for rushing waterfall roar
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

        // Layer 2: Sparkling Water Splash Ripples (High-frequency foam & bubbles)
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

  // Canvas Waterfall, Stream & Leaping Catfish Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 560);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 560;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePosRef.current = { x, y, active: true };

      // Interactive fish leap triggered near mouse cursor!
      if (Math.random() > 0.72 && activeFishes.length < 4) {
        spawnFishAt(x, y);
      }
    };
    const handleMouseLeave = () => {
      mousePosRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Waterfall curtain droplets falling from top
    interface WaterDrop {
      x: number;
      y: number;
      speed: number;
      length: number;
      alpha: number;
      width: number;
    }
    const waterDrops: WaterDrop[] = Array.from({ length: 110 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.5,
      speed: Math.random() * 8 + 6,
      length: Math.random() * 28 + 18,
      alpha: Math.random() * 0.5 + 0.2,
      width: Math.random() * 2.2 + 1,
    }));

    // River mist particles
    interface FoamParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }
    const foamParticles: FoamParticle[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: height * 0.35 + Math.random() * (height * 0.65),
      vx: (Math.random() - 0.5) * 1.4 + 0.9,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 3 + 1.5,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    // Leaping Catfish (Authentic whiskers and dark-golden body)
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

    const spawnFishAt = (targetX: number, targetY: number) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      activeFishes.push({
        x: targetX,
        y: targetY,
        startX: targetX - direction * 60,
        startY: Math.max(targetY, height * 0.45),
        t: 0,
        duration: 85 + Math.floor(Math.random() * 35),
        peakHeight: 75 + Math.random() * 55,
        distance: 180 + Math.random() * 90,
        direction,
        scale: 0.9 + Math.random() * 0.4,
      });

      waterRipples.push({
        x: targetX,
        y: targetY,
        radius: 6,
        alpha: 0.9,
      });
    };

    interface Ripple {
      x: number;
      y: number;
      radius: number;
      alpha: number;
    }
    const waterRipples: Ripple[] = [];

    let waveTick = 0;
    let autoFishCountdown = 60;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      waveTick += 0.025;

      // 1. Cascading Waterfall Curtains
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const streamHeight = height * (0.32 + i * 0.08);
        ctx.moveTo(0, 0);

        for (let x = 0; x <= width; x += 25) {
          const cascadeY =
            streamHeight +
            Math.sin(x * 0.02 + waveTick * 2.2 + i) * 16 +
            Math.cos(x * 0.04 - waveTick * 1.5) * 8;
          ctx.lineTo(x, cascadeY);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const waterGrad = ctx.createLinearGradient(0, 0, 0, height);
        if (i === 0) {
          waterGrad.addColorStop(0, 'rgba(0, 135, 81, 0.08)');
          waterGrad.addColorStop(0.4, 'rgba(0, 107, 63, 0.16)');
          waterGrad.addColorStop(1, 'rgba(0, 82, 48, 0.24)');
        } else if (i === 1) {
          waterGrad.addColorStop(0, 'rgba(232, 196, 104, 0.06)');
          waterGrad.addColorStop(0.5, 'rgba(0, 135, 81, 0.2)');
          waterGrad.addColorStop(1, 'rgba(0, 50, 30, 0.3)');
        } else {
          waterGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
          waterGrad.addColorStop(0.3, 'rgba(179, 224, 201, 0.22)');
          waterGrad.addColorStop(1, 'rgba(0, 107, 63, 0.35)');
        }
        ctx.fillStyle = waterGrad;
        ctx.fill();
      }

      // 2. Falling Waterfall Water Droplets
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      waterDrops.forEach((d) => {
        d.y += d.speed;
        if (d.y > height * 0.6) {
          waterRipples.push({
            x: d.x,
            y: d.y,
            radius: 2,
            alpha: 0.45,
          });
          d.y = 0;
          d.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.lineWidth = d.width;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + Math.sin(waveTick) * 2, d.y + d.length);
        ctx.stroke();
      });

      // 3. Drifting Mist & Bubbles
      foamParticles.forEach((f) => {
        f.x += f.vx;
        f.y += f.vy;
        if (f.x > width) f.x = 0;
        if (f.x < 0) f.x = width;
        if (f.y > height) f.y = height * 0.4;
        if (f.y < height * 0.35) f.y = height * 0.9;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 196, 104, ${f.alpha})`;
        ctx.fill();
      });

      // 4. Water Ripples
      for (let i = waterRipples.length - 1; i >= 0; i--) {
        const r = waterRipples[i];
        r.radius += 1.8;
        r.alpha -= 0.02;
        if (r.alpha <= 0) {
          waterRipples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.38, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(232, 196, 104, ${r.alpha})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 5. Fish Spawn & Leap
      autoFishCountdown--;
      if (autoFishCountdown <= 0 && activeFishes.length < 3) {
        const randX = Math.random() * (width * 0.7) + width * 0.15;
        const randY = height * 0.65 + Math.random() * 60;
        spawnFishAt(randX, randY);
        autoFishCountdown = 140 + Math.floor(Math.random() * 100);
      }

      for (let i = activeFishes.length - 1; i >= 0; i--) {
        const fish = activeFishes[i];
        fish.t += 1 / fish.duration;

        if (fish.t >= 1) {
          waterRipples.push({
            x: fish.x,
            y: fish.startY,
            radius: 9,
            alpha: 0.9,
          });
          activeFishes.splice(i, 1);
          continue;
        }

        const prog = fish.t;
        fish.x = fish.startX + fish.direction * fish.distance * prog;
        const arcY = 4 * fish.peakHeight * prog * (1 - prog);
        fish.y = fish.startY - arcY;

        const tangent = 4 * fish.peakHeight * (1 - 2 * prog);
        const rotation = Math.atan2(-tangent, fish.direction * fish.distance);

        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.rotate(rotation);
        ctx.scale(fish.scale, fish.scale);

        ctx.shadowColor = '#E8C468';
        ctx.shadowBlur = 14;

        // Catfish Profile
        ctx.beginPath();
        ctx.moveTo(24 * fish.direction, 0);
        ctx.quadraticCurveTo(12 * fish.direction, -9, -10 * fish.direction, -6);
        ctx.quadraticCurveTo(-20 * fish.direction, -3, -28 * fish.direction, -8);
        ctx.lineTo(-24 * fish.direction, 0);
        ctx.lineTo(-28 * fish.direction, 8);
        ctx.quadraticCurveTo(-20 * fish.direction, 4, -10 * fish.direction, 6);
        ctx.quadraticCurveTo(12 * fish.direction, 9, 24 * fish.direction, 0);
        ctx.closePath();

        const fishGrad = ctx.createLinearGradient(-28, -6, 24, 6);
        fishGrad.addColorStop(0, '#1c1b18');
        fishGrad.addColorStop(0.4, '#B8922E');
        fishGrad.addColorStop(0.8, '#E8C468');
        fishGrad.addColorStop(1, '#FFF8E7');
        ctx.fillStyle = fishGrad;
        ctx.fill();

        // Barbels / Whiskers
        ctx.beginPath();
        ctx.moveTo(20 * fish.direction, -2);
        ctx.quadraticCurveTo(12 * fish.direction, -12, -4 * fish.direction, -10);
        ctx.moveTo(20 * fish.direction, 3);
        ctx.quadraticCurveTo(12 * fish.direction, 14, -4 * fish.direction, 12);
        ctx.moveTo(16 * fish.direction, 5);
        ctx.quadraticCurveTo(8 * fish.direction, 16, 0, 14);
        ctx.strokeStyle = '#FFF8E7';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(16 * fish.direction, -3, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF8E7';
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Waterfall & River Canvas Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <canvas ref={canvasRef} className="w-full h-full opacity-85" />
      </div>

      {/* Prominent Floating Audio Player & Equalizer */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-2">
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border-2 border-[#D4A843] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-[#008751] text-white ring-4 ring-emerald-300'
                  : 'bg-amber-500 hover:bg-amber-600 text-white animate-bounce'
              }`}
            >
              <span className="text-base">{isPlayingAudio ? '🔊' : '▶'}</span>
              <span>
                {isPlayingAudio
                  ? 'Playing Waterfall & Stream Sound'
                  : 'TAP HERE: Play Waterfall & Stream Sound'}
              </span>
            </button>

            {isPlayingAudio && (
              <div className="flex items-end gap-1 h-5 px-2">
                <span className="w-1 bg-[#008751] animate-pulse h-3" />
                <span className="w-1 bg-[#008751] animate-pulse delay-75 h-5" />
                <span className="w-1 bg-[#008751] animate-pulse delay-150 h-2" />
                <span className="w-1 bg-[#008751] animate-pulse delay-100 h-4" />
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <span>Volume:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 accent-[#008751] cursor-pointer"
            />
            <span className="text-[10px] text-gray-400">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
