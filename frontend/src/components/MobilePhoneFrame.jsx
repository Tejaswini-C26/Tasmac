import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Smartphone, 
  Maximize2, 
  RotateCcw, 
  Monitor, 
  Sparkles,
  Info
} from 'lucide-react';

export function MobilePhoneFrame({ 
  children, 
  enabled = true,
  onSwitchToLaptop,
  onDisableFrame
}) {
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formatted = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes}`;
      setCurrentTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-start bg-zinc-200/70 dark:bg-[#060709] p-2 sm:p-4 overflow-y-auto selection:bg-orange-500 selection:text-white">
      {/* Top Device Simulator Controller Bar */}
      <div className="w-full max-w-md shrink-0 mb-2 flex items-center justify-between px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-[#121318]/90 backdrop-blur-md border border-zinc-200 dark:border-white/10 text-xs font-mono shadow-sm">
        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
          <Smartphone className="w-3.5 h-3.5 text-orange-500" />
          <span className="font-bold text-zinc-900 dark:text-zinc-200">Mobile Phone View</span>
          <span className="text-[10px] text-zinc-400 hidden sm:inline">(390px)</span>
        </div>

        <div className="flex items-center gap-1.5">
          {onDisableFrame && (
            <button
              type="button"
              onClick={onDisableFrame}
              title="Expand to Full Width Mobile View"
              className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Full Mobile</span>
            </button>
          )}

          {onSwitchToLaptop && (
            <button
              type="button"
              onClick={onSwitchToLaptop}
              title="Switch back to Laptop View"
              className="px-2 py-0.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <Monitor className="w-3 h-3" />
              <span>Laptop View</span>
            </button>
          )}
        </div>
      </div>

      {/* Realistic Mobile Device Mockup Frame */}
      <div className="relative w-full max-w-[400px] h-[844px] max-h-[calc(100vh-60px)] shrink-0 flex flex-col rounded-[50px] p-3 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 shadow-[0_25px_70px_rgba(0,0,0,0.6)] border-4 border-zinc-700/60 dark:border-zinc-800 ring-1 ring-white/10">
        
        {/* Outer Phone Shell Buttons (Stylistic details) */}
        <div className="absolute -left-[5px] top-[100px] w-[3px] h-[32px] bg-zinc-600 rounded-l" />
        <div className="absolute -left-[5px] top-[145px] w-[3px] h-[50px] bg-zinc-600 rounded-l" />
        <div className="absolute -left-[5px] top-[205px] w-[3px] h-[50px] bg-zinc-600 rounded-l" />
        <div className="absolute -right-[5px] top-[130px] w-[3px] h-[65px] bg-zinc-600 rounded-r" />

        {/* Inner Phone Screen */}
        <div className="relative w-full h-full rounded-[40px] overflow-hidden flex flex-col bg-[#f8f7f6] dark:bg-[#000000] border border-black/20 dark:border-white/5">
          
          {/* iOS / Mobile Status Bar with Dynamic Island */}
          <div className="shrink-0 h-10 w-full bg-white dark:bg-[#000000] flex items-center justify-between px-6 select-none z-40 border-b border-black/5 dark:border-white/5">
            {/* Clock */}
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-white font-sans tracking-tight">
              {currentTime}
            </span>

            {/* Dynamic Island Pill */}
            <div className="h-5 w-24 bg-black dark:bg-[#0f0f11] rounded-full mx-auto flex items-center justify-end px-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-1.5 text-zinc-900 dark:text-white">
              <Signal className="w-3.5 h-3.5 stroke-[2]" />
              <Wifi className="w-3.5 h-3.5 stroke-[2]" />
              <Battery className="w-4 h-4 stroke-[2]" />
            </div>
          </div>

          {/* Render Actual App inside Phone Screen */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
            {children}
          </div>

          {/* iOS Home Indicator Bar at the bottom */}
          <div className="shrink-0 h-4 w-full bg-white dark:bg-[#090a0d] flex items-center justify-center select-none pointer-events-none z-50">
            <div className="w-32 h-1 bg-zinc-300 dark:bg-white/25 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

