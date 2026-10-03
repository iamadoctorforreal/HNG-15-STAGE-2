'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

export function RiverAmbience() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ source: AudioNode; gain: GainNode } | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  // Web Audio Waterfall Generator
  const toggleAudio = useCallback(() => {
    if (isPlayingAudio) {
      if (audioContextRef.current) {
        audioContextRef.current.suspend();
      }
      setIsPlayingAudio(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioContextRef.current) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;

          // Generate authentic rushing waterfall sound (pink/brown noise with cascading filter)
          const bufferSize = ctx.sampleRate * 4;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          let b0 = 0, b1 = 0, b2 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99 * b0 + white * 0.05;
            b1 = 0.95 * b1 + white * 0.1;
            b2 = 0.85 * b2 + white * 0.25;
            data[i] = (b0 + b1 + b2) * 0.6;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          noise.loop = true;

          // Dual Filter for realistic waterfall roar & stream splash
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, ctx.currentTime);
          filter.Q.setValueAtTime(1.5, ctx.currentTime);

          const highPass = ctx.createBiquadFilter();
          highPass.type = 'highpass';
          highPass.frequency.setValueAtTime(80, ctx.currentTime);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.12, ctx.currentTime); // calming, audible ambient volume

          noise.connect(highPass);
          highPass.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          noise.start(0);
          audioNodesRef.current = { source: noise, gain };
        } else {
          audioContextRef.current.resume();
        }
        setIsPlayingAudio(true);
      } catch (e) {
        console.error('Waterfall audio failed to start:', e);
      }
    }
  }, [isPlayingAudio]);

  // Canvas Waterfall, Flowing Stream & Interactive Leaping Catfish
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

    // Mouse movement tracker for interactive fish flashing
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };

      // Spontaneous interactive fish spawn on hover!
      if (Math.random() > 0.7 && activeFishes.length < 5) {
        spawnFishAt(e.clientX - rect.left, e.clientY - rect.top);
      }
    };
    const handleMouseLeave = () => {
      mousePosRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Waterfall cascade droplets falling from top
    interface WaterDrop {
      x: number;
      y: number;
      speed: number;
      length: number;
      alpha: number;
      width: number;
    }
    const waterDrops: WaterDrop[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.45,
      speed: Math.random() * 6 + 5,
      length: Math.random() * 25 + 15,
      alpha: Math.random() * 0.4 + 0.15,
      width: Math.random() * 2 + 1,
    }));

    // Floating foam and river mist particles
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
      y: height * 0.35 + Math.random() * (height * 0.65),
      vx: (Math.random() - 0.5) * 1.2 + 0.8, // downstream drift
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 3 + 1.5,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    // Interactive Swimming & Leaping Catfish (with authentic whiskers, dorsal fins)
    interface Catfish {
      x: number;
      y: number;
      startX: number;
      startY: number;
      t: number;
      duration: number;
      peakHeight: number;
      distance: number;
      direction: number; // 1 for right, -1 for left
      isLeaping: boolean;
      scale: number;
    }

    const activeFishes: Catfish[] = [];

    const spawnFishAt = (targetX: number, targetY: number) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      activeFishes.push({
        x: targetX,
        y: targetY,
        startX: targetX - direction * 60,
        startY: Math.max(targetY, height * 0.4),
        t: 0,
        duration: 90 + Math.floor(Math.random() * 40),
        peakHeight: 70 + Math.random() * 50,
        distance: 160 + Math.random() * 100,
        direction,
        isLeaping: true,
        scale: 0.9 + Math.random() * 0.4,
      });

      // Trigger ripple
      waterRipples.push({
        x: targetX,
        y: targetY,
        radius: 6,
        alpha: 0.9,
      });
    };

    // Splash ripples
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      alpha: number;
    }
    const waterRipples: Ripple[] = [];

    let waveTick = 0;
    let autoFishCountdown = 80;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      waveTick += 0.025;

      // 1. RUSHING WATERFALL CURTAIN FROM TOP
      // Cascading streams coming down from the top edge
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const startX = 0;
        const streamHeight = height * (0.35 + i * 0.08);
        ctx.moveTo(startX, 0);

        for (let x = 0; x <= width; x += 25) {
          const cascadeY =
            streamHeight +
            Math.sin(x * 0.02 + waveTick * 2 + i) * 16 +
            Math.cos(x * 0.04 - waveTick * 1.5) * 8;
          ctx.lineTo(x, cascadeY);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const waterGrad = ctx.createLinearGradient(0, 0, 0, height);
        if (i === 0) {
          waterGrad.addColorStop(0, 'rgba(0, 135, 81, 0.08)');
          waterGrad.addColorStop(0.4, 'rgba(0, 107, 63, 0.15)');
          waterGrad.addColorStop(1, 'rgba(0, 82, 48, 0.22)');
        } else if (i === 1) {
          waterGrad.addColorStop(0, 'rgba(232, 196, 104, 0.06)');
          waterGrad.addColorStop(0.5, 'rgba(0, 135, 81, 0.18)');
          waterGrad.addColorStop(1, 'rgba(0, 50, 30, 0.28)');
        } else {
          waterGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
          waterGrad.addColorStop(0.3, 'rgba(179, 224, 201, 0.18)');
          waterGrad.addColorStop(1, 'rgba(0, 107, 63, 0.32)');
        }
        ctx.fillStyle = waterGrad;
        ctx.fill();
      }

      // 2. FALLING WATER DROPLETS (Rushing Waterfall Effect)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      waterDrops.forEach((d) => {
        d.y += d.speed;
        if (d.y > height * 0.55) {
          // Splash into river pool
          waterRipples.push({
            x: d.x,
            y: d.y,
            radius: 2,
            alpha: 0.4,
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

      // 3. DRIFTING RIVER MIST & FOAM
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

      // 4. WATER RIPPLES ON WATER SURFACE
      for (let i = waterRipples.length - 1; i >= 0; i--) {
        const r = waterRipples[i];
        r.radius += 1.6;
        r.alpha -= 0.018;
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

      // 5. AUTONOMOUS & INTERACTIVE LEAPING CATFISH
      autoFishCountdown--;
      if (autoFishCountdown <= 0 && activeFishes.length < 3) {
        const randX = Math.random() * (width * 0.7) + width * 0.15;
        const randY = height * 0.65 + Math.random() * 60;
        spawnFishAt(randX, randY);
        autoFishCountdown = 160 + Math.floor(Math.random() * 120);
      }

      // Render each active catfish in realistic leaping arc
      for (let i = activeFishes.length - 1; i >= 0; i--) {
        const fish = activeFishes[i];
        fish.t += 1 / fish.duration;

        if (fish.t >= 1) {
          // Splash re-entry
          waterRipples.push({
            x: fish.x,
            y: fish.startY,
            radius: 8,
            alpha: 0.9,
          });
          activeFishes.splice(i, 1);
          continue;
        }

        // Parabolic Leap: y = startY - 4 * peak * t * (1 - t)
        const prog = fish.t;
        fish.x = fish.startX + fish.direction * fish.distance * prog;
        const arcY = 4 * fish.peakHeight * prog * (1 - prog);
        fish.y = fish.startY - arcY;

        // Angle of flight
        const tangent = 4 * fish.peakHeight * (1 - 2 * prog);
        const rotation = Math.atan2(-tangent, fish.direction * fish.distance);

        // Draw authentic African catfish with distinctive head, whiskers, sleek body
        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.rotate(rotation);
        ctx.scale(fish.scale, fish.scale);

        // Golden & emerald glowing aura
        ctx.shadowColor = '#E8C468';
        ctx.shadowBlur = 14;

        // Catfish Body (Dark ebony top, golden bronze belly, sleek scaleless Clarias profile)
        ctx.beginPath();
        ctx.moveTo(24 * fish.direction, 0); // Flat snout / mouth
        ctx.quadraticCurveTo(12 * fish.direction, -9, -10 * fish.direction, -6); // Broad dorsal back
        ctx.quadraticCurveTo(-20 * fish.direction, -3, -28 * fish.direction, -8); // Tail fin upper lobe
        ctx.lineTo(-24 * fish.direction, 0); // Tail fork
        ctx.lineTo(-28 * fish.direction, 8); // Tail fin lower lobe
        ctx.quadraticCurveTo(-20 * fish.direction, 4, -10 * fish.direction, 6); // Belly
        ctx.quadraticCurveTo(12 * fish.direction, 9, 24 * fish.direction, 0); // Head
        ctx.closePath();

        const fishGrad = ctx.createLinearGradient(-28, -6, 24, 6);
        fishGrad.addColorStop(0, '#1c1b18'); // Dark ebony tail
        fishGrad.addColorStop(0.4, '#B8922E'); // Rich ochre gold body
        fishGrad.addColorStop(0.8, '#E8C468'); // Golden sheen
        fishGrad.addColorStop(1, '#FFF8E7'); // Radiant head
        ctx.fillStyle = fishGrad;
        ctx.fill();

        // Characteristic Catfish Barbels (Long Whisker Filaments)
        ctx.beginPath();
        // Upper barbels
        ctx.moveTo(20 * fish.direction, -2);
        ctx.quadraticCurveTo(12 * fish.direction, -12, -4 * fish.direction, -10);
        // Lower barbels
        ctx.moveTo(20 * fish.direction, 3);
        ctx.quadraticCurveTo(12 * fish.direction, 14, -4 * fish.direction, 12);
        // Chin barbels
        ctx.moveTo(16 * fish.direction, 5);
        ctx.quadraticCurveTo(8 * fish.direction, 16, 0, 14);
        ctx.strokeStyle = '#FFF8E7';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Eye of the Catfish
        ctx.beginPath();
        ctx.arc(16 * fish.direction, -3, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF8E7';
        ctx.fill();

        ctx.restore();

        // Droplet spray in flight
        if (Math.random() > 0.4) {
          waterRipples.push({
            x: fish.x - fish.direction * 12,
            y: fish.y + 6,
            radius: 2,
            alpha: 0.6,
          });
        }
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
      {/* Full Waterfall & River Ambient Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <canvas ref={canvasRef} className="w-full h-full opacity-85" />
      </div>

      {/* Prominent Waterfall Sound Controller Banner */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <button
          onClick={toggleAudio}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-3 backdrop-blur-md shadow-md border transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-[#008751] text-white border-emerald-400 ring-4 ring-emerald-300/40 shadow-emerald-900/30'
              : 'bg-white/95 hover:bg-white text-gray-800 border-emerald-200 hover:border-emerald-400'
          }`}
          title="Click to hear the soothing sound of Abeokuta farm waterfall and swimming catfish"
        >
          <span className="text-base">{isPlayingAudio ? '🌊' : '🔊'}</span>
          <span>
            {isPlayingAudio
              ? 'Abeokuta Farm Waterfall & Stream (Playing Sound)'
              : 'Click to Hear the Abeokuta Farm Waterfall & Water Flow'}
          </span>
          {isPlayingAudio ? (
            <span className="flex gap-1 items-end h-3.5">
              <span className="w-1 h-2 bg-white animate-pulse" />
              <span className="w-1 h-3.5 bg-white animate-pulse delay-75" />
              <span className="w-1 h-2.5 bg-white animate-pulse delay-150" />
            </span>
          ) : (
            <span className="text-[10px] bg-emerald-100 text-[#006b3f] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
              Audio
            </span>
          )}
        </button>
      </div>
    </>
  );
}
