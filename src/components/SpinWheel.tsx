"use client";

import { useEffect, useRef, useState } from "react";

type SpinWheelProps = {
  members: string[];
  open: boolean;
  onClose: () => void;
  onEliminate: (member: string) => void;
};

export default function SpinWheel({
  members,
  open,
  onClose,
  onEliminate,
}: SpinWheelProps) {
  const n = members.length;
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B195', '#C06C84', '#6C5B7B', '#355C7D'
  ];

  useEffect(() => {
    if (!open || members.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 30;

    const drawWheel = () => {
      // Enable anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const sliceAngle = (2 * Math.PI) / members.length;
      
      members.forEach((member, index) => {
        const startAngle = index * sliceAngle + (rotation * Math.PI / 180);
        const endAngle = startAngle + sliceAngle;
        
        // Draw slice with gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        const color = colors[index % colors.length];
        gradient.addColorStop(0, color + 'F0');
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, color + 'DD');
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        
        // Draw text with better positioning
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // Truncate long names
        const displayName = member.length > 10 ? member.slice(0, 8) + '...' : member;
        ctx.fillText(displayName, radius - 40, 12);
        ctx.restore();
      });
      
      // Draw center circle with gradient
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
      centerGradient.addColorStop(0, '#374151');
      centerGradient.addColorStop(1, '#1f2937');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
      ctx.fillStyle = centerGradient;
      ctx.fill();
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 5;
      ctx.stroke();
      
      // Inner glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, 47, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    
    drawWheel();
  }, [members, rotation, open, colors]);

  const spinWheel = () => {
    if (spinning || members.length === 0) return;
    
    setSpinning(true);
    setResult(null);
    
    const randomSpins = 5 + Math.random() * 3;
    const randomDegree = Math.random() * 360;
    const totalRotation = randomSpins * 360 + randomDegree;
    
    const duration = 4500;
    const startTime = Date.now();
    const startRotation = rotation;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentRotation = startRotation + totalRotation * easeOut;
      
      setRotation(currentRotation % 360);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // The wheel slices start at index 0 at angle 0 (3 o'clock position)
        // The pointer is at the top (12 o'clock = -90 degrees or 270 degrees)
        // We need to find which slice is at -90 degrees after rotation
        const normalizedRotation = ((currentRotation % 360) + 360) % 360;
        const sliceAngle = 360 / members.length;
        
        // Calculate which slice is at the top (-90 degrees from start)
        // We need to offset by -90 degrees (or +270) to account for pointer position
        const topAngle = (270 - normalizedRotation + 360) % 360;
        const winningIndex = Math.floor(topAngle / sliceAngle) % members.length;
        const winner = members[winningIndex];
        
        setSelectedMember(winner);
        setSpinning(false);
      }
    };
    
    animate();
  };

  const setSelectedMember = (member: string) => {
    setResult(member);
  };

  const handleEliminate = () => {
    if (result) {
      onEliminate(result);
      setTimeout(() => {
        setResult(null);
        onClose();
      }, 500);
    }
  };

  const handleReset = () => {
    setResult(null);
    setRotation(0);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-950/95 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative bg-gradient-to-br from-gray-800/90 via-slate-800/90 to-gray-900/90 rounded-3xl shadow-2xl border border-gray-600/30 p-6 max-w-2xl w-full my-4 backdrop-blur-xl">
        
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-cyan-400/30 rounded-tl-3xl"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-pink-400/30 rounded-br-3xl"></div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-gray-700/60 hover:bg-gray-600/80 text-gray-300 hover:text-white transition-all duration-200 flex items-center justify-center group border border-gray-600/30 hover:border-gray-500/50"
          aria-label="Close"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-block mb-2">
            <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-400 rounded-full"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-pink-300 bg-clip-text text-transparent mb-2">
            Random Selection
          </h2>
          <p className="text-gray-400 text-sm">
            Spin the wheel to randomly select a participant
          </p>
        </div>

        {/* Wheel Container */}
        <div className="relative mb-6">
          {/* Enhanced Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-20">
            <div className="relative">
              <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[26px] border-t-gradient-to-r from-yellow-400 to-orange-400 drop-shadow-2xl filter brightness-110" 
                   style={{ borderTopColor: '#fbbf24' }}></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Canvas with glow effect */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-96 h-96 md:w-[450px] md:h-[450px] bg-gradient-to-br from-cyan-400/10 via-transparent to-pink-400/10 rounded-full blur-2xl"></div>
            </div>
            <canvas
              ref={canvasRef}
              width={700}
              height={700}
              className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] rounded-full shadow-2xl border-4 border-gray-600/40"
              style={{
                filter: spinning ? 'blur(0.8px) brightness(1.1)' : 'brightness(1)',
                transition: 'filter 0.3s',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
            />
          </div>
          
          {/* Spinning indicator */}
          {spinning && (
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 animate-pulse">
              <div className="px-4 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-full backdrop-blur-sm">
                <span className="text-cyan-300 font-semibold text-xs flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></div>
                  Spinning...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Result Display */}
        {result && !spinning && (
          <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-gray-700/50 to-slate-700/50 border-2 border-gray-600/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-pink-500/5"></div>
            <div className="relative text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-300 uppercase tracking-wider font-bold">Eliminated Participant</span>
              </div>
              <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-300 to-pink-300 bg-clip-text text-transparent">
                {result}
              </div>
              <p className="text-xs text-gray-400">Review and confirm the elimination below</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!result ? (
            <button
              onClick={spinWheel}
              disabled={spinning || members.length === 0}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-bold text-base hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-500 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] border border-white/10"
            >
              {spinning ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Spinning...
                </span>
              ) : (
                'Spin Wheel'
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleEliminate}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-base hover:from-red-400 hover:to-rose-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] border border-white/10"
              >
                Confirm Elimination
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold text-base hover:from-gray-500 hover:to-gray-600 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-gray-500/30"
              >
                Spin Again
              </button>
            </>
          )}
        </div>

        {/* Member Count with icon */}
        <div className="mt-4 text-center flex items-center justify-center gap-2 text-xs text-gray-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <span>{members.length} participant{members.length !== 1 ? 's' : ''} in pool</span>
        </div>
      </div>
    </div>
  );
}
