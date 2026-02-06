import React from 'react';
import { cn } from '@/lib/utils';

export type FrameTone = 'titanium' | 'silver' | 'graphite' | 'obsidian' | 'gold' | 'rose-gold';

const FRAME_STYLES: Record<FrameTone, {
  background: string;
  shadow: string;
  button: string;
  border: string;
}> = {
  titanium: {
    background: 'linear-gradient(135deg, #e5e5e5 0%, #d4d4d4 20%, #a3a3a3 50%, #d4d4d4 80%, #e5e5e5 100%)',
    shadow: '0 0 0 2px #5a5a5a, 0 20px 50px -10px rgba(0,0,0,0.5)',
    button: '#b0b0b0',
    border: '#4a4a4a'
  },
  silver: {
    background: 'linear-gradient(135deg, #f5f5f7 0%, #e2e2e4 20%, #c7c7cc 50%, #e2e2e4 80%, #f5f5f7 100%)',
    shadow: '0 0 0 2px #d1d1d6, 0 20px 50px -10px rgba(0,0,0,0.5)',
    button: '#d1d1d6',
    border: '#c7c7cc'
  },
  graphite: {
    background: 'linear-gradient(135deg, #5e5e5e 0%, #4a4a4a 20%, #333333 50%, #4a4a4a 80%, #5e5e5e 100%)',
    shadow: '0 0 0 2px #333333, 0 20px 50px -10px rgba(0,0,0,0.5)',
    button: '#4a4a4a',
    border: '#333333'
  },
  obsidian: {
    background: 'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 20%, #111111 50%, #2a2a2a 80%, #3a3a3a 100%)',
    shadow: '0 0 0 2px #111111, 0 20px 50px -10px rgba(0,0,0,0.5)',
    button: '#2a2a2a',
    border: '#111111'
  },
  gold: {
    background: 'linear-gradient(135deg, #fceecb 0%, #f5dca0 20%, #e6c17a 50%, #f5dca0 80%, #fceecb 100%)',
    shadow: '0 0 0 2px #d4af37, 0 20px 50px -10px rgba(0,0,0,0.5)',
    button: '#f5dca0',
    border: '#d4af37'
  },
  'rose-gold': {
    background: 'linear-gradient(135deg, #fddde6 0%, #fbbad0 20%, #e08fa9 50%, #fbbad0 80%, #fddde6 100%)',
    shadow: '0 0 0 2px #e08fa9, 0 20px 50px -10px rgba(0,0,0,0.5)',
    button: '#fbbad0',
    border: '#e08fa9'
  }
};

export interface IPhoneMockupProps {
  children?: React.ReactNode;
  isPowered?: boolean;
  showNotch?: boolean;
  className?: string;
  frameTone?: FrameTone;
}

export function IPhoneMockup({
  children,
  isPowered = true,
  showNotch = true,
  className,
  frameTone = 'titanium'
}: IPhoneMockupProps) {
  const styles = FRAME_STYLES[frameTone];

  return (
    <div className={cn("relative mx-auto", className)} style={{ width: '360px', height: '780px' }}>
      {/* Outer Frame */}
      <div 
        className="absolute inset-0 rounded-[55px] shadow-2xl border-[6px] bg-[#2a2a2a] overflow-hidden"
        style={{
          borderColor: styles.border,
          boxShadow: styles.shadow,
          background: styles.background
        }}
      >
        {/* Inner Frame (Black Bezel) */}
        <div className="absolute inset-[3px] bg-black rounded-[48px] overflow-hidden border-[4px] border-black">
          
          {/* Screen Content */}
          <div className={cn(
            "w-full h-full bg-black overflow-hidden relative transition-opacity duration-500",
            isPowered ? "opacity-100" : "opacity-0"
          )}>
            {children}
            
            {/* Glass Reflection/Gloss Effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent opacity-30 z-20" />
          </div>

          {/* Dynamic Island */}
          {showNotch && (
            <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-50 flex items-center justify-center gap-3 px-3 transition-all duration-300 hover:w-[180px] hover:h-[45px] group">
              {/* Selfie Camera */}
              <div className="w-3 h-3 rounded-full bg-[#1a1a1a] ring-1 ring-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-blue-900/40" />
              </div>
              {/* FaceID Sensors (Hidden but implied space) */}
              <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Antenna Bands */}
        <div className="absolute top-[80px] left-0 w-[3px] h-[12px] bg-[#888] opacity-40" />
        <div className="absolute top-[80px] right-0 w-[3px] h-[12px] bg-[#888] opacity-40" />
        <div className="absolute bottom-[80px] left-0 w-[3px] h-[12px] bg-[#888] opacity-40" />
        <div className="absolute bottom-[80px] right-0 w-[3px] h-[12px] bg-[#888] opacity-40" />
      </div>

      {/* Physical Buttons */}
      {/* Left Side: Mute Switch & Volume */}
      <div 
        className="absolute top-[100px] -left-[4px] w-[4px] h-[26px] rounded-l-md shadow-sm" 
        style={{ backgroundColor: styles.button }}
      /> {/* Action Button */}
      <div 
        className="absolute top-[150px] -left-[4px] w-[4px] h-[50px] rounded-l-md shadow-sm" 
        style={{ backgroundColor: styles.button }}
      /> {/* Volume Up */}
      <div 
        className="absolute top-[215px] -left-[4px] w-[4px] h-[50px] rounded-l-md shadow-sm" 
        style={{ backgroundColor: styles.button }}
      /> {/* Volume Down */}

      {/* Right Side: Power */}
      <div 
        className="absolute top-[180px] -right-[4px] w-[4px] h-[80px] rounded-r-md shadow-sm" 
        style={{ backgroundColor: styles.button }}
      /> {/* Power Button */}

    </div>
  );
}
