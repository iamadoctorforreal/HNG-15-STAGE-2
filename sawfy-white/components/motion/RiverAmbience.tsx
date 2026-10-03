'use client';

import React, { useEffect, useRef, useState } from 'react';

export function RiverAmbience() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ source: AudioNode; gain: GainNode } | null>(null);

  // Canvas River & Leaping Fish Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    window.addEventListener('resize', handleResize);

    // River mist particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }
    const particles: Particle[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4 + 0.3, // gently drifting downstream
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 2.5 + 1,
      alpha: Math.random() * 0.35 + 0.1,
    }));

    // Leaping fish state
    interface LeapingFish {
      active: boolean;
      startX: number;
      startY: number;
      x: number;
      y: number;
      t: number; // 0 to 1
      duration: number;
      peakHeight: number;
      distance: number;
      direction: number; // 1 for right, -1 for left
      rotation: number;
    }

    let fish: LeapingFish = {
      active: false,
      startX: 0,
      startY: 0,
      x: 0,
      y: 0,
      t: 0,
      duration: 140, // frames
      peakHeight: 90,
      distance: 220,
      direction: 1,
      rotation: 0,
    };

    let timeUntilNextLeap = 120; // frame countdown

    // Splash ripples
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      alpha: number;
    }
    const ripples: Ripple[] = [];

    let waveOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      waveOffset += 0.02;

      // Draw subtle organic river currents
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const baseHeight = height * (0.65 + i * 0.12);
        const waveSpeed = waveOffset * (1 + i * 0.4);
        ctx.moveTo(0, baseHeight);

        for (let x = 0; x <= width; x += 30) {
          const y =
            baseHeight +
            Math.sin(x * 0.008 + waveSpeed) * 12 +
            Math.sin(x * 0.015 - waveSpeed * 0.5) * 6;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, baseHeight, 0, height);
        if (i === 0) {
          grad.addColorStop(0, 'rgba(0, 135, 81, 0.06)');
          grad.addColorStop(1, 'rgba(0, 82, 48, 0.15)');
        } else if (i === 1) {
          grad.addColorStop(0, 'rgba(212, 168, 67, 0.04)');
          grad.addColorStop(1, 'rgba(0, 107, 63, 0.18)');
        } else {
          grad.addColorStop(0, 'rgba(0, 135, 81, 0.08)');
          grad.addColorStop(1, 'rgba(0, 50, 30, 0.25)');
        }
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Draw drifting river particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;
        if (p.y > height) p.y = height * 0.5;
        if (p.y < height * 0.4) p.y = height * 0.9;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 196, 104, ${p.alpha})`;
        ctx.fill();
      });

      // Manage ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.2;
        r.alpha -= 0.015;
        if (r.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(232, 196, 104, ${r.alpha * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Fish leaping animation
      if (!fish.active) {
        timeUntilNextLeap--;
        if (timeUntilNextLeap <= 0) {
          fish.active = true;
          fish.direction = Math.random() > 0.5 ? 1 : -1;
          fish.startX =
            fish.direction === 1
              ? width * 0.2 + Math.random() * (width * 0.3)
              : width * 0.8 - Math.random() * (width * 0.3);
          fish.startY = height * 0.75 + Math.random() * 30;
          fish.t = 0;
          fish.duration = 80 + Math.floor(Math.random() * 30);
          fish.peakHeight = 75 + Math.random() * 45;
          fish.distance = 180 + Math.random() * 80;

          // Splash on start
          ripples.push({
            x: fish.startX,
            y: fish.startY,
            radius: 4,
            alpha: 0.8,
          });
        }
      } else {
        fish.t += 1 / fish.duration;
        if (fish.t >= 1) {
          fish.active = false;
          timeUntilNextLeap = 180 + Math.floor(Math.random() * 150); // wait 3-5s for next leap
          // Splash on re-entry
          ripples.push({
            x: fish.x,
            y: fish.startY,
            radius: 6,
            alpha: 0.9,
          });
        } else {
          // Parabolic trajectory: y = 4 * peak * t * (1 - t)
          const prog = fish.t;
          fish.x = fish.startX + fish.direction * fish.distance * prog;
          const arcY = 4 * fish.peakHeight * prog * (1 - prog);
          fish.y = fish.startY - arcY;

          // Angle of motion
          const tangent = 4 * fish.peakHeight * (1 - 2 * prog);
          fish.rotation = Math.atan2(-tangent, fish.direction * fish.distance);

          // Draw graceful silhouette of leaping catfish
          ctx.save();
          ctx.translate(fish.x, fish.y);
          ctx.rotate(fish.rotation);

          // Golden glistening glow
          ctx.shadowColor = '#E8C468';
          ctx.shadowBlur = 12;

          // Fish body (sleek catfish profile)
          ctx.beginPath();
          ctx.moveTo(18 * fish.direction, 0); // nose
          ctx.quadraticCurveTo(8 * fish.direction, -6, -8 * fish.direction, -3); // back
          ctx.quadraticCurveTo(-14 * fish.direction, -1, -20 * fish.direction, -5); // tail fin upper
          ctx.lineTo(-17 * fish.direction, 0); // tail fork
          ctx.lineTo(-20 * fish.direction, 5); // tail fin lower
          ctx.quadraticCurveTo(-14 * fish.direction, 1, -8 * fish.direction, 4); // belly
          ctx.quadraticCurveTo(8 * fish.direction, 6, 18 * fish.direction, 0); // head
          ctx.closePath();

          const fishGrad = ctx.createLinearGradient(-20, 0, 20, 0);
          fishGrad.addColorStop(0, '#B8922E');
          fishGrad.addColorStop(0.5, '#E8C468');
          fishGrad.addColorStop(1, '#FFF8E7');
          ctx.fillStyle = fishGrad;
          ctx.fill();

          // Catfish whisker filaments trailing
          ctx.beginPath();
          ctx.moveTo(14 * fish.direction, -1);
          ctx.quadraticCurveTo(8 * fish.direction, -7, -2 * fish.direction, -6);
          ctx.moveTo(14 * fish.direction, 2);
          ctx.quadraticCurveTo(8 * fish.direction, 8, -2 * fish.direction, 7);
          ctx.strokeStyle = '#FFF8E7';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.restore();

          // Little water spray droplets behind fish
          if (Math.random() > 0.4) {
            ripples.push({
              x: fish.x - fish.direction * 10,
              y: fish.y + 4,
              radius: 1.5,
              alpha: 0.5,
            });
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Synthetic Gentle River Stream Sound (Web Audio API brown noise stream)
  const toggleAudio = () => {
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

          // Generate 5 seconds of soft brown noise (gentle rushing waterfall/river)
          const bufferSize = ctx.sampleRate * 4;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            lastOut = (lastOut + 0.02 * white) / 1.02;
            data[i] = lastOut * 1.8;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          noise.loop = true;

          // Low-pass filter to sound like gentle running water stream
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, ctx.currentTime);
          filter.Q.setValueAtTime(1.2, ctx.currentTime);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.08, ctx.currentTime); // gentle ambient volume

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          noise.start(0);
          audioNodesRef.current = { source: noise, gain };
        } else {
          audioContextRef.current.resume();
        }
        setIsPlayingAudio(true);
      } catch (e) {
        console.error('Audio stream could not start:', e);
      }
    }
  };

  return (
    <>
      {/* Background Canvas Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <canvas ref={canvasRef} className="w-full h-full opacity-65" />
      </div>

      {/* Floating River Sound Button */}
      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={toggleAudio}
          className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 backdrop-blur-md shadow-lg border transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-[#008751] text-white border-emerald-400 shadow-emerald-900/30 ring-2 ring-emerald-300'
              : 'bg-white/90 text-gray-700 border-gray-200 hover:bg-white'
          }`}
          title="Toggle peaceful Abeokuta River and waterfall ambience"
        >
          <span className="text-sm">{isPlayingAudio ? '🌊' : '🔇'}</span>
          <span className="hidden sm:inline">
            {isPlayingAudio ? 'Abeokuta River: Playing' : 'Listen to River Flow'}
          </span>
          {isPlayingAudio && (
            <span className="flex gap-0.5 items-end h-3">
              <span className="w-0.5 h-2 bg-white animate-pulse" />
              <span className="w-0.5 h-3 bg-white animate-pulse delay-75" />
              <span className="w-0.5 h-1.5 bg-white animate-pulse delay-150" />
            </span>
          )}
        </button>
      </div>
    </>
  );
}
