'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

export function WaterfallBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [scrollPercent, setScrollPercent] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Track page scroll to pan down the waterfall to the bottom pool
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

  // Audio Engine: Natural "Whoosh-Whoosh" Cascading Waterfall Roar & Splashing Ripples
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

        // Layer 1: Rushing Torrent (Continuous Brown Noise Stream with gentle whoosh surges)
        const bufferSize = ctx.sampleRate * 4;
        const waterfallBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = waterfallBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.03 * white) / 1.03;
          // Subtly modulate volume with rhythmic surging "whoosh" waves
          const whoosh = 1 + 0.25 * Math.sin((i / ctx.sampleRate) * Math.PI * 0.8);
          data[i] = lastOut * 3.2 * whoosh;
        }

        const waterfallSource = ctx.createBufferSource();
        waterfallSource.buffer = waterfallBuffer;
        waterfallSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(780, ctx.currentTime);
        filter.Q.setValueAtTime(1.6, ctx.currentTime);

        const cascadeGain = ctx.createGain();
        cascadeGain.gain.setValueAtTime(0.45, ctx.currentTime);

        waterfallSource.connect(filter);
        filter.connect(cascadeGain);
        cascadeGain.connect(masterGain);
        waterfallSource.start(0);

        // Layer 2: Crystal Water Splashes & Ripples (Foam / High-frequency spray)
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
        foamFilter.frequency.setValueAtTime(2100, ctx.currentTime);
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

  // Programmatic 3D/Photorealistic Water Ripples, Streamlines & Leaping Fishes Simulation
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

    // Ripple model
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
    }
    const ripples: Ripple[] = [];

    // Water droplet spray model
    interface SprayDrop {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      gravity: number;
    }
    const sprayDrops: SprayDrop[] = [];

    const addSplash = (x: number, y: number, intensity = 1) => {
      ripples.push({
        x,
        y,
        radius: 6,
        maxRadius: 65 * intensity,
        alpha: 0.85,
      });

      const dropCount = Math.floor(12 * intensity);
      for (let i = 0; i < dropCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.5;
        sprayDrops.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3.5,
          size: Math.random() * 2.5 + 1,
          alpha: 0.9,
          gravity: 0.18,
        });
      }
    };

    // Photorealistic Swimming and Leaping Fish Model
    interface Fish {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      vx: number;
      vy: number;
      length: number;
      width: number;
      color: string;
      finColor: string;
      phase: number;
      tailWagSpeed: number;
      state: 'swimming' | 'leaping' | 'diving';
      leapProgress: number;
      leapDuration: number;
      leapStartX: number;
      leapStartY: number;
      leapDistance: number;
      leapPeak: number;
      direction: number;
      depth: number; // 0 = surface, 1 = deep
    }

    const fishes: Fish[] = [
      {
        x: width * 0.42,
        y: height * 0.82,
        targetX: width * 0.48,
        targetY: height * 0.85,
        vx: 0.6,
        vy: 0.2,
        length: 48,
        width: 14,
        color: '#C84028', // Rich crimson-salmon
        finColor: '#E86A33',
        phase: 0,
        tailWagSpeed: 0.14,
        state: 'swimming',
        leapProgress: 0,
        leapDuration: 90,
        leapStartX: 0,
        leapStartY: 0,
        leapDistance: 160,
        leapPeak: 75,
        direction: 1,
        depth: 0.3,
      },
      {
        x: width * 0.55,
        y: height * 0.86,
        targetX: width * 0.62,
        targetY: height * 0.83,
        vx: -0.7,
        vy: -0.15,
        length: 42,
        width: 12,
        color: '#D4A843', // Golden Abeokuta Catfish
        finColor: '#E8C468',
        phase: Math.PI / 2,
        tailWagSpeed: 0.16,
        state: 'swimming',
        leapProgress: 0,
        leapDuration: 85,
        leapStartX: 0,
        leapStartY: 0,
        leapDistance: 140,
        leapPeak: 70,
        direction: -1,
        depth: 0.5,
      },
      {
        x: width * 0.48,
        y: height * 0.88,
        targetX: width * 0.52,
        targetY: height * 0.87,
        vx: 0.5,
        vy: -0.1,
        length: 52,
        width: 15,
        color: '#A02818', // Deep royal salmon
        finColor: '#D47A40',
        phase: Math.PI,
        tailWagSpeed: 0.12,
        state: 'swimming',
        leapProgress: 0,
        leapDuration: 100,
        leapStartX: 0,
        leapStartY: 0,
        leapDistance: 180,
        leapPeak: 90,
        direction: 1,
        depth: 0.2,
      },
    ];

    // Trigger leap occasionally or upon interaction
    const triggerLeap = (fish: Fish) => {
      fish.state = 'leaping';
      fish.leapProgress = 0;
      fish.leapStartX = fish.x;
      fish.leapStartY = fish.y;
      fish.direction = Math.random() > 0.5 ? 1 : -1;
      fish.leapDistance = 140 + Math.random() * 80;
      fish.leapPeak = 65 + Math.random() * 50;
      fish.leapDuration = 70 + Math.floor(Math.random() * 30);
      addSplash(fish.x, fish.y, 0.9);
    };

    // User interaction: clicking or hovering near water causes ripples & fish leaps
    const handlePointerDown = (e: MouseEvent) => {
      addSplash(e.clientX, e.clientY, 1.2);
      // Trigger nearest swimming fish to leap if close
      for (const f of fishes) {
        if (f.state === 'swimming') {
          triggerLeap(f);
          break;
        }
      }
    };
    window.addEventListener('click', handlePointerDown);

    let leapTimer = 0;
    let waveTick = 0;

    // Waterfall cascade streamlines running down the center chute
    interface StreamLine {
      xRatio: number;
      y: number;
      speed: number;
      length: number;
      alpha: number;
      width: number;
    }
    const streamLines: StreamLine[] = Array.from({ length: 35 }, () => ({
      xRatio: 0.44 + Math.random() * 0.14,
      y: Math.random() * height * 0.6,
      speed: Math.random() * 9 + 6,
      length: Math.random() * 40 + 25,
      alpha: Math.random() * 0.4 + 0.25,
      width: Math.random() * 2 + 1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      waveTick += 0.03;
      leapTimer++;

      // 1. Draw flowing waterfall whitewater streamlines cascading down rocks
      for (const s of streamLines) {
        s.y += s.speed;
        if (s.y > height * 0.75) {
          s.y = 0;
          s.xRatio = 0.44 + Math.random() * 0.14;
        }
        const streamX = width * s.xRatio + Math.sin(s.y * 0.02 + waveTick) * 8;

        ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(streamX, s.y);
        ctx.lineTo(streamX + (Math.random() - 0.5) * 4, s.y + s.length);
        ctx.stroke();
      }

      // 2. Draw and update water ripples in the bottom pool
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.3;
        r.alpha -= 0.016;

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius * 1.8, r.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, r.alpha)})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Secondary inner ripple highlight
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius * 1.1, r.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(230, 245, 237, ${Math.max(0, r.alpha * 0.6)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        if (r.alpha <= 0) {
          ripples.splice(i, 1);
        }
      }

      // 3. Draw water spray droplets
      for (let i = sprayDrops.length - 1; i >= 0; i--) {
        const d = sprayDrops[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += d.gravity;
        d.alpha -= 0.02;

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, d.alpha)})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();

        if (d.alpha <= 0 || d.y > height) {
          sprayDrops.splice(i, 1);
        }
      }

      // 4. Update and render Photorealistic 3D Fishes in the bottom river pool
      const poolYMin = height * 0.74;
      const poolYMax = height * 0.94;

      for (const fish of fishes) {
        fish.phase += fish.tailWagSpeed;

        if (fish.state === 'swimming') {
          // Smooth patrolling swim in pool
          fish.x += fish.vx;
          fish.y += fish.vy;

          if (fish.x < width * 0.32 || fish.x > width * 0.68) {
            fish.vx *= -1;
            fish.direction = fish.vx > 0 ? 1 : -1;
          }
          if (fish.y < poolYMin || fish.y > poolYMax) {
            fish.vy *= -1;
          }

          // Gentle ambient ripple behind swimming fish
          if (Math.random() > 0.94) {
            ripples.push({
              x: fish.x,
              y: fish.y,
              radius: 4,
              maxRadius: 22,
              alpha: 0.45,
            });
          }

          // Render swimming fish under water with realistic refraction & glossy scales
          ctx.save();
          ctx.translate(fish.x, fish.y);
          const swimAngle = Math.atan2(fish.vy, fish.vx);
          ctx.rotate(swimAngle);

          // Fish body gradient
          const fishGrad = ctx.createLinearGradient(-fish.length / 2, 0, fish.length / 2, 0);
          fishGrad.addColorStop(0, '#1A2026');
          fishGrad.addColorStop(0.3, fish.color);
          fishGrad.addColorStop(0.7, '#E8C468');
          fishGrad.addColorStop(1, '#FFFFFF');

          ctx.fillStyle = fishGrad;
          ctx.beginPath();
          // Tapered hydrodynamic body with undulating tail
          const tailOffset = Math.sin(fish.phase) * 5;
          ctx.moveTo(fish.length / 2, 0);
          ctx.quadraticCurveTo(0, -fish.width / 2, -fish.length / 2, tailOffset);
          ctx.quadraticCurveTo(0, fish.width / 2, fish.length / 2, 0);
          ctx.fill();

          // Tail Fin
          ctx.fillStyle = fish.finColor;
          ctx.beginPath();
          ctx.moveTo(-fish.length / 2, tailOffset);
          ctx.lineTo(-fish.length / 2 - 14, tailOffset - 9);
          ctx.lineTo(-fish.length / 2 - 10, tailOffset);
          ctx.lineTo(-fish.length / 2 - 14, tailOffset + 9);
          ctx.closePath();
          ctx.fill();

          // Pectoral Fin
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.ellipse(4, 5, 8, 3, Math.PI / 4 + Math.sin(fish.phase) * 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Eye glint
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(fish.length / 2 - 5, -2, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1A1A1A';
          ctx.beginPath();
          ctx.arc(fish.length / 2 - 4.5, -2, 1, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        } else if (fish.state === 'leaping') {
          // Parabolic 3D Arch Leap through the air
          fish.leapProgress += 1;
          const p = fish.leapProgress / fish.leapDuration;

          if (p >= 1) {
            fish.state = 'swimming';
            fish.x = fish.leapStartX + fish.direction * fish.leapDistance;
            fish.y = fish.leapStartY;
            addSplash(fish.x, fish.y, 1.1);
            continue;
          }

          const currentX = fish.leapStartX + fish.direction * fish.leapDistance * p;
          const arcY = -Math.sin(p * Math.PI) * fish.leapPeak;
          const currentY = fish.leapStartY + arcY;

          ctx.save();
          ctx.translate(currentX, currentY);

          // Calculate rotation along parabolic curve
          const dy = -Math.cos(p * Math.PI) * fish.leapPeak * (Math.PI / fish.leapDuration);
          const dx = (fish.direction * fish.leapDistance) / fish.leapDuration;
          let angle = Math.atan2(dy, dx);
          if (fish.direction === -1) {
            ctx.scale(-1, 1);
            angle = -angle;
          }
          ctx.rotate(angle);

          // Vibrant 3D Glossy scales during leap (catching daylight)
          const leapGrad = ctx.createLinearGradient(-fish.length / 2, 0, fish.length / 2, 0);
          leapGrad.addColorStop(0, '#2D1B10');
          leapGrad.addColorStop(0.35, fish.color);
          leapGrad.addColorStop(0.75, '#FFD700');
          leapGrad.addColorStop(1, '#FFF5EA');

          ctx.fillStyle = leapGrad;
          ctx.beginPath();
          const leapTailWag = Math.sin(fish.phase * 2) * 6;
          ctx.moveTo(fish.length / 2, 0);
          ctx.quadraticCurveTo(0, -fish.width / 2 - 2, -fish.length / 2, leapTailWag);
          ctx.quadraticCurveTo(0, fish.width / 2 + 2, fish.length / 2, 0);
          ctx.fill();

          // Broad dorsal fin spread in air
          ctx.fillStyle = fish.finColor;
          ctx.beginPath();
          ctx.moveTo(-6, -fish.width / 2);
          ctx.quadraticCurveTo(-14, -fish.width / 2 - 10, -22, -fish.width / 2);
          ctx.fill();

          // Tail fin splash
          ctx.beginPath();
          ctx.moveTo(-fish.length / 2, leapTailWag);
          ctx.lineTo(-fish.length / 2 - 16, leapTailWag - 11);
          ctx.lineTo(-fish.length / 2 - 11, leapTailWag);
          ctx.lineTo(-fish.length / 2 - 16, leapTailWag + 11);
          ctx.closePath();
          ctx.fill();

          // Bright water drops shedding off jumping fish
          if (Math.random() > 0.5) {
            sprayDrops.push({
              x: currentX + (Math.random() - 0.5) * 10,
              y: currentY + (Math.random() - 0.5) * 10,
              vx: (Math.random() - 0.5) * 2,
              vy: Math.random() * 2,
              size: 1.5,
              alpha: 0.9,
              gravity: 0.2,
            });
          }

          ctx.restore();
        }
      }

      // Interval trigger: a fish leaps spontaneously every 5 to 7 seconds
      if (leapTimer % 180 === 0) {
        const available = fishes.filter((f) => f.state === 'swimming');
        if (available.length > 0) {
          triggerLeap(available[Math.floor(Math.random() * available.length)]);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handlePointerDown);
    };
  }, []);

  // Vertical position percentage as user scrolls (0% top waterfall -> 100% bottom river fishes)
  const verticalPosition = `${Math.round(scrollPercent * 100)}%`;

  return (
    <>
      {/* 2K Photorealistic Waterfall Background that pans from top cascades to bottom pool on scroll */}
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
        {/* Warm Abeokuta Cream Overlay for harmonious readability and brand identity */}
        <div className="absolute inset-0 bg-[#FAF8F5]/75 backdrop-blur-[0.5px] pointer-events-none" />

        {/* Programmatic 3D Water Streams, Concentric Ripples & Photorealistic Leaping Fish Layer */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      </div>

      {/* Floating Waterfall Audio Controller with "Whoosh-Whoosh" Rushing Cascades */}
      <div className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-[#D4A843] shadow-2xl flex items-center gap-2.5">
        <button
          onClick={toggleAudio}
          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-[#008751] text-white ring-2 ring-emerald-300'
              : 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
          }`}
          title="Toggle waterfall roar & rushing stream sound"
        >
          <span>{isPlayingAudio ? '🔊' : '▶'}</span>
          <span>{isPlayingAudio ? 'Waterfall Audio: On' : 'Hear Waterfall Roar'}</span>
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
