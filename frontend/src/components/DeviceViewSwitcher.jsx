import React from 'react';
import { Monitor, Smartphone, Sliders, SmartphoneNfc } from 'lucide-react';

export function DeviceViewSwitcher({ 
  deviceViewMode, 
  onToggleDeviceView, 
  isFrameMode, 
  onToggleFrameMode,
  isSmallScreen 
}) {
  return (
    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-0.5 rounded-xl font-mono text-xs select-none">
      {/* Laptop View Toggle Button */}
      <button
        type="button"
        onClick={() => onToggleDeviceView('laptop')}
        title="Switch to Laptop / Desktop View (Full multi-column layout, sidebar & command center)"
        className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
          deviceViewMode === 'laptop'
            ? 'bg-orange-600 text-white shadow-sm'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
        }`}
      >
        <Monitor className="w-3.5 h-3.5 stroke-[2]" />
        <span className="hidden sm:inline">Laptop</span>
      </button>

      {/* Mobile View Toggle Button */}
      <button
        type="button"
        onClick={() => onToggleDeviceView('mobile')}
        title="Switch to Mobile View (Handheld touch layout, bottom navigation bar & compact cards)"
        className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
          deviceViewMode === 'mobile'
            ? 'bg-orange-600 text-white shadow-sm'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
        }`}
      >
        <Smartphone className="w-3.5 h-3.5 stroke-[2]" />
        <span className="hidden sm:inline">Mobile</span>
      </button>

      {/* Frame Mode Toggle (Visible when user selects Mobile view on a laptop screen) */}
      {!isSmallScreen && deviceViewMode === 'mobile' && onToggleFrameMode && (
        <button
          type="button"
          onClick={onToggleFrameMode}
          title={isFrameMode ? "Switch to Full-Screen Mobile Layout" : "Switch to Centered Phone Device Frame Preview"}
          className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-bold border transition-all cursor-pointer ml-0.5 ${
            isFrameMode
              ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <SmartphoneNfc className="w-3 h-3" />
          <span>{isFrameMode ? 'Frame' : 'Full'}</span>
        </button>
      )}
    </div>
  );
}

