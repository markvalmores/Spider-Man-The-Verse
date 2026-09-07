import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerControls, ParkourState, CameraMode } from './CityTypes';
import { DeviceInfo } from '../../utils/deviceDetector';

interface PlayStationTouchOverlayProps {
  deviceInfo: DeviceInfo;
  onControlChange: (key: keyof PlayerControls, val: boolean) => void;
  parkourState?: ParkourState;
  cameraMode?: CameraMode;
  onToggleCameraMode?: () => void;
  onOpenPhotoMode?: () => void;
  onOpenSettings?: () => void;
  onInteractWithCitizen?: () => void;
  nearbyCitizen?: boolean;
  onClimbAction?: () => void;
}

export default function PlayStationTouchOverlay({
  deviceInfo,
  onControlChange,
  parkourState = 'none',
  cameraMode,
  onToggleCameraMode,
  onOpenPhotoMode,
  onOpenSettings,
  onInteractWithCitizen,
  nearbyCitizen,
  onClimbAction,
}: PlayStationTouchOverlayProps) {
  // Mobile device verification (iOS / Android / Touchscreen mobile)
  const isMobileDevice =
    deviceInfo.type === 'mobile_phone' ||
    deviceInfo.type === 'mobile_tablet' ||
    deviceInfo.isTouch ||
    (typeof window !== 'undefined' && (
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      window.innerWidth <= 1024
    ));

  // Active button press states for visual feedback
  const [activeButtons, setActiveButtons] = useState<Record<string, boolean>>({});

  // Virtual Analog Stick State
  const [stickActive, setStickActive] = useState<boolean>(false);
  const [stickPos, setStickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const stickTouchId = useRef<number | null>(null);
  const stickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const stickBaseRef = useRef<HTMLDivElement>(null);

  // Haptic feedback trigger
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // haptics unavailable
      }
    }
  }, []);

  // Button Press Handlers
  const handleButtonDown = useCallback(
    (btnId: string, controlKey: keyof PlayerControls | 'citizen' | 'climb' | 'photo' | 'camera' | 'settings') => {
      triggerHaptic();
      setActiveButtons((prev) => ({ ...prev, [btnId]: true }));

      if (controlKey === 'citizen') {
        if (onInteractWithCitizen) onInteractWithCitizen();
      } else if (controlKey === 'climb') {
        if (onClimbAction) onClimbAction();
      } else if (controlKey === 'photo') {
        if (onOpenPhotoMode) onOpenPhotoMode();
      } else if (controlKey === 'camera') {
        if (onToggleCameraMode) onToggleCameraMode();
      } else if (controlKey === 'settings') {
        if (onOpenSettings) onOpenSettings();
      } else {
        onControlChange(controlKey as keyof PlayerControls, true);
      }
    },
    [onControlChange, triggerHaptic, onInteractWithCitizen, onClimbAction, onOpenPhotoMode, onToggleCameraMode, onOpenSettings]
  );

  const handleButtonUp = useCallback(
    (btnId: string, controlKey: keyof PlayerControls | 'citizen' | 'climb' | 'photo' | 'camera' | 'settings') => {
      setActiveButtons((prev) => ({ ...prev, [btnId]: false }));
      if (
        controlKey !== 'citizen' &&
        controlKey !== 'climb' &&
        controlKey !== 'photo' &&
        controlKey !== 'camera' &&
        controlKey !== 'settings'
      ) {
        onControlChange(controlKey as keyof PlayerControls, false);
      }
    },
    [onControlChange]
  );

  // Analog Stick Touch Logic
  const handleStickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (stickTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    stickTouchId.current = touch.identifier;

    if (stickBaseRef.current) {
      const rect = stickBaseRef.current.getBoundingClientRect();
      stickCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    setStickActive(true);
    triggerHaptic();
  };

  const handleStickMove = useCallback(
    (e: TouchEvent) => {
      if (stickTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === stickTouchId.current) {
          const dx = touch.clientX - stickCenterRef.current.x;
          const dy = touch.clientY - stickCenterRef.current.y;
          const maxRadius = 42;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          const clampedDist = Math.min(dist, maxRadius);

          const nx = Math.cos(angle) * (clampedDist / maxRadius);
          const ny = Math.sin(angle) * (clampedDist / maxRadius);

          setStickPos({ x: Math.cos(angle) * clampedDist, y: Math.sin(angle) * clampedDist });

          // Thresholds for 4-direction motion
          const deadzone = 0.28;
          onControlChange('forward', ny < -deadzone);
          onControlChange('backward', ny > deadzone);
          onControlChange('left', nx < -deadzone);
          onControlChange('right', nx > deadzone);
          break;
        }
      }
    },
    [onControlChange]
  );

  const handleStickEnd = useCallback(
    (e: TouchEvent) => {
      if (stickTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === stickTouchId.current) {
          stickTouchId.current = null;
          setStickActive(false);
          setStickPos({ x: 0, y: 0 });
          onControlChange('forward', false);
          onControlChange('backward', false);
          onControlChange('left', false);
          onControlChange('right', false);
          break;
        }
      }
    },
    [onControlChange]
  );

  useEffect(() => {
    window.addEventListener('touchmove', handleStickMove, { passive: false });
    window.addEventListener('touchend', handleStickEnd);
    window.addEventListener('touchcancel', handleStickEnd);
    return () => {
      window.removeEventListener('touchmove', handleStickMove);
      window.removeEventListener('touchend', handleStickEnd);
      window.removeEventListener('touchcancel', handleStickEnd);
    };
  }, [handleStickMove, handleStickEnd]);

  // Only render on iOS, Android, and mobile touchscreen devices
  if (!isMobileDevice) {
    return null;
  }

  return (
    <div
      id="playstation-touch-overlay"
      className="fixed inset-0 z-30 pointer-events-none select-none overflow-hidden font-sans"
      style={{ touchAction: 'none' }}
    >
      {/* ======================================================== */}
      {/* 1. TOP SHOULDER & TRIGGER BUTTONS (L1, L2, R1, R2) */}
      {/* ======================================================== */}
      <div className="absolute top-3 inset-x-3 flex justify-between items-start pointer-events-none">
        {/* Left Shoulders: L1 (Stick/Crawl) & L2 (Acrobatics/Somersault) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* L2 Trigger: Acrobatics / Air Somersault */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('l2', 'acrobat');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('l2', 'acrobat');
            }}
            onMouseDown={() => handleButtonDown('l2', 'acrobat')}
            onMouseUp={() => handleButtonUp('l2', 'acrobat')}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-75 ${
              activeButtons['l2']
                ? 'bg-fuchsia-600/60 border-fuchsia-300 scale-90 shadow-fuchsia-500/50'
                : 'bg-neutral-950/35 border-white/20 text-neutral-200 hover:bg-neutral-900/50'
            }`}
            title="L2: Somersaults & Acrobatics"
          >
            <span className="text-[13px] font-black tracking-wider text-fuchsia-300">L2</span>
            <span className="text-[8px] font-bold text-neutral-300 uppercase -mt-0.5">Acrobat</span>
          </button>

          {/* L1 Bumper: Wall Stick / Adhesion */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('l1', 'stick');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('l1', 'stick');
            }}
            onMouseDown={() => handleButtonDown('l1', 'stick')}
            onMouseUp={() => handleButtonUp('l1', 'stick')}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-75 ${
              activeButtons['l1'] || parkourState === 'wall_stick' || parkourState === 'wall_crawl'
                ? 'bg-amber-600/60 border-amber-300 scale-90 shadow-amber-500/50'
                : 'bg-neutral-950/35 border-white/20 text-neutral-200 hover:bg-neutral-900/50'
            }`}
            title="L1: Wall Stick & Wall Crawl"
          >
            <span className="text-[13px] font-black tracking-wider text-amber-300">L1</span>
            <span className="text-[8px] font-bold text-neutral-300 uppercase -mt-0.5">Stick</span>
          </button>
        </div>

        {/* Center System Utility Bar (Share / Camera / Options) */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-neutral-950/40 border border-white/15 px-2 py-1 rounded-full backdrop-blur-md shadow-xl">
          {/* Share / Photo Mode */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('share', 'photo');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('share', 'photo');
            }}
            className="px-2 py-1 rounded-full text-neutral-300 active:text-white active:bg-white/20 text-[10px] font-bold flex items-center gap-1"
            title="Photo Mode"
          >
            <span>📸</span>
            <span className="hidden sm:inline">PHOTO</span>
          </button>

          <span className="text-white/20">•</span>

          {/* Camera View Toggle */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('cam', 'camera');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('cam', 'camera');
            }}
            className="px-2 py-1 rounded-full text-neutral-300 active:text-white active:bg-white/20 text-[10px] font-bold flex items-center gap-1"
            title="Toggle Camera View"
          >
            <span>⟲</span>
            <span className="hidden sm:inline">{cameraMode === 'first_person' ? 'FP' : 'TP'}</span>
          </button>

          <span className="text-white/20">•</span>

          {/* Options / Settings */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('options', 'settings');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('options', 'settings');
            }}
            className="px-2 py-1 rounded-full text-neutral-300 active:text-white active:bg-white/20 text-[10px] font-bold flex items-center gap-1"
            title="Settings & Save Data"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">MENU</span>
          </button>
        </div>

        {/* Right Shoulders: R1 (Sprint/Wall Run) & R2 (Web Swing) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* R1 Bumper: Sprint / Wall Run Surge */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('r1', 'sprint');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('r1', 'sprint');
            }}
            onMouseDown={() => handleButtonDown('r1', 'sprint')}
            onMouseUp={() => handleButtonUp('r1', 'sprint')}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-75 ${
              activeButtons['r1']
                ? 'bg-emerald-600/60 border-emerald-300 scale-90 shadow-emerald-500/50'
                : 'bg-neutral-950/35 border-white/20 text-neutral-200 hover:bg-neutral-900/50'
            }`}
            title="R1: Sprint & Skyscraper Wall Run"
          >
            <span className="text-[13px] font-black tracking-wider text-emerald-300">R1</span>
            <span className="text-[8px] font-bold text-neutral-300 uppercase -mt-0.5">Sprint</span>
          </button>

          {/* R2 Trigger: Web Swing / High-Speed Arc Traversal */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('r2', 'swing');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('r2', 'swing');
            }}
            onMouseDown={() => handleButtonDown('r2', 'swing')}
            onMouseUp={() => handleButtonUp('r2', 'swing')}
            className={`flex flex-col items-center justify-center w-20 h-13 rounded-2xl border-2 backdrop-blur-md shadow-2xl transition-all duration-75 ${
              activeButtons['r2']
                ? 'bg-red-600/70 border-red-300 scale-90 shadow-red-500/60'
                : 'bg-gradient-to-b from-red-950/40 to-neutral-950/40 border-red-400/40 text-white hover:border-red-400'
            }`}
            title="R2: Web Swing & Glide"
          >
            <div className="flex items-center gap-1">
              <span className="text-sm font-black tracking-wider text-red-300">R2</span>
              <span className="text-xs">🕸️</span>
            </div>
            <span className="text-[9px] font-extrabold text-red-200 uppercase -mt-0.5">SWING</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. BOTTOM LEFT: SEE-THROUGH PLAYSTATION D-PAD & STICK */}
      {/* ======================================================== */}
      <div className="absolute bottom-4 left-4 flex flex-col items-center gap-3 pointer-events-auto">
        {/* Virtual Analog Thumbstick & D-Pad Hybrid Hub */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* Outer Translucent Glass Ring */}
          <div
            ref={stickBaseRef}
            onTouchStart={handleStickStart}
            className={`absolute inset-0 rounded-full border border-white/20 backdrop-blur-md transition-colors shadow-2xl ${
              stickActive ? 'bg-neutral-900/40 border-sky-400/50' : 'bg-neutral-950/25'
            }`}
          >
            {/* Center Thumbstick Nub */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center shadow-xl transition-transform duration-75 ${
                stickActive
                  ? 'bg-gradient-to-br from-sky-500/70 to-blue-600/70 border-sky-300 scale-105 shadow-sky-500/40'
                  : 'bg-neutral-900/50 text-white/60'
              }`}
              style={{
                transform: `translate(calc(-50% + ${stickPos.x}px), calc(-50% + ${stickPos.y}px))`,
              }}
            >
              {/* PlayStation Grip Rings & Logo Detail */}
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                <span className="text-xs font-black text-white/80">L3</span>
              </div>
            </div>
          </div>

          {/* D-Pad Directional Arrows (Up, Down, Left, Right) for quick tapping */}
          {/* UP Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('dpad_up', 'forward');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('dpad_up', 'forward');
            }}
            onMouseDown={() => handleButtonDown('dpad_up', 'forward')}
            onMouseUp={() => handleButtonUp('dpad_up', 'forward')}
            className={`absolute top-1 left-1/2 -translate-x-1/2 w-12 h-10 rounded-xl border backdrop-blur-sm flex items-center justify-center transition-all ${
              activeButtons['dpad_up']
                ? 'bg-white/40 border-white scale-90'
                : 'bg-neutral-950/40 border-white/15 text-white/80 hover:bg-white/20'
            }`}
            title="Up: Walk Forward"
          >
            <span className="text-base font-black">▲</span>
          </button>

          {/* DOWN Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('dpad_down', 'backward');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('dpad_down', 'backward');
            }}
            onMouseDown={() => handleButtonDown('dpad_down', 'backward')}
            onMouseUp={() => handleButtonUp('dpad_down', 'backward')}
            className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-10 rounded-xl border backdrop-blur-sm flex items-center justify-center transition-all ${
              activeButtons['dpad_down']
                ? 'bg-white/40 border-white scale-90'
                : 'bg-neutral-950/40 border-white/15 text-white/80 hover:bg-white/20'
            }`}
            title="Down: Backpedal"
          >
            <span className="text-base font-black">▼</span>
          </button>

          {/* LEFT Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('dpad_left', 'left');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('dpad_left', 'left');
            }}
            onMouseDown={() => handleButtonDown('dpad_left', 'left')}
            onMouseUp={() => handleButtonUp('dpad_left', 'left')}
            className={`absolute left-1 top-1/2 -translate-y-1/2 w-10 h-12 rounded-xl border backdrop-blur-sm flex items-center justify-center transition-all ${
              activeButtons['dpad_left']
                ? 'bg-white/40 border-white scale-90'
                : 'bg-neutral-950/40 border-white/15 text-white/80 hover:bg-white/20'
            }`}
            title="Left: Strafe Left"
          >
            <span className="text-base font-black">◀</span>
          </button>

          {/* RIGHT Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('dpad_right', 'right');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('dpad_right', 'right');
            }}
            onMouseDown={() => handleButtonDown('dpad_right', 'right')}
            onMouseUp={() => handleButtonUp('dpad_right', 'right')}
            className={`absolute right-1 top-1/2 -translate-y-1/2 w-10 h-12 rounded-xl border backdrop-blur-sm flex items-center justify-center transition-all ${
              activeButtons['dpad_right']
                ? 'bg-white/40 border-white scale-90'
                : 'bg-neutral-950/40 border-white/15 text-white/80 hover:bg-white/20'
            }`}
            title="Right: Strafe Right"
          >
            <span className="text-base font-black">▶</span>
          </button>
        </div>

        {/* Tactical Wall-Crawl Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handleButtonDown('crawl_btn', 'crawl');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleButtonUp('crawl_btn', 'crawl');
          }}
          className={`px-3 py-1.5 rounded-full border backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeButtons['crawl_btn'] || parkourState === 'wall_crawl'
              ? 'bg-amber-600/70 border-amber-300 text-amber-100 scale-95'
              : 'bg-neutral-950/40 border-white/15 text-neutral-300'
          }`}
          title="Hold to Crawl on Walls"
        >
          <span>🕷️</span>
          <span>WALL CRAWL</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM RIGHT: PLAYSTATION ACTION DIAMOND (△ ◯ ✕ ▢) */}
      {/* ======================================================== */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center gap-2 pointer-events-auto">
        {/* Contextual Ledge Hoist Banner (Visible during ledge grab) */}
        {parkourState === 'ledge_hang' && onClimbAction && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('climb_btn', 'climb');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('climb_btn', 'climb');
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 border border-yellow-200 rounded-2xl shadow-2xl text-neutral-950 font-black text-sm flex items-center gap-1.5 animate-pulse active:scale-95"
          >
            <span>⬆️ CLIMB UP [✕]</span>
          </button>
        )}

        {/* Citizen Greet Banner */}
        {nearbyCitizen && onInteractWithCitizen && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('citizen_btn', 'citizen');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('citizen_btn', 'citizen');
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 border border-emerald-200 rounded-2xl shadow-2xl text-neutral-950 font-black text-xs flex items-center gap-1 active:scale-95"
          >
            <span>🤝 GREET [△]</span>
          </button>
        )}

        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Subtle see-through diamond guide */}
          <div className="absolute inset-2 rounded-full border border-white/10 bg-neutral-950/20 backdrop-blur-sm pointer-events-none" />

          {/* ======================================================== */}
          {/* TRIANGLE (△) - Top: Web Zip / Citizen Greet / Special */}
          {/* ======================================================== */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('ps_triangle', 'zip');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('ps_triangle', 'zip');
            }}
            onMouseDown={() => handleButtonDown('ps_triangle', 'zip')}
            onMouseUp={() => handleButtonUp('ps_triangle', 'zip')}
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-15 h-15 rounded-full border-2 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl transition-all duration-75 ${
              activeButtons['ps_triangle']
                ? 'bg-emerald-500/70 border-emerald-300 scale-90 shadow-emerald-500/60'
                : 'bg-neutral-950/35 border-emerald-500/40 text-emerald-400 hover:border-emerald-400'
            }`}
            title="Triangle: Web Zip to point"
          >
            <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">
              △
            </span>
            <span className="text-[8px] font-bold text-emerald-200 uppercase -mt-1">ZIP</span>
          </button>

          {/* ======================================================== */}
          {/* CIRCLE (◯) - Right: Ground Slam / Crouch / Dodge */}
          {/* ======================================================== */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('ps_circle', 'slam');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('ps_circle', 'slam');
            }}
            onMouseDown={() => handleButtonDown('ps_circle', 'slam')}
            onMouseUp={() => handleButtonUp('ps_circle', 'slam')}
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-15 h-15 rounded-full border-2 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl transition-all duration-75 ${
              activeButtons['ps_circle']
                ? 'bg-red-500/70 border-red-300 scale-90 shadow-red-500/60'
                : 'bg-neutral-950/35 border-red-500/40 text-red-400 hover:border-red-400'
            }`}
            title="Circle: Ground Slam & Dodge"
          >
            <span className="text-2xl font-black text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]">
              ◯
            </span>
            <span className="text-[8px] font-bold text-red-200 uppercase -mt-1">SLAM</span>
          </button>

          {/* ======================================================== */}
          {/* CROSS (✕) - Bottom: Jump / Vault / Ledge Hoist */}
          {/* ======================================================== */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('ps_cross', 'jump');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('ps_cross', 'jump');
            }}
            onMouseDown={() => handleButtonDown('ps_cross', 'jump')}
            onMouseUp={() => handleButtonUp('ps_cross', 'jump')}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-15 h-15 rounded-full border-2 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl transition-all duration-75 ${
              activeButtons['ps_cross']
                ? 'bg-blue-500/70 border-blue-300 scale-90 shadow-blue-500/60'
                : 'bg-neutral-950/35 border-blue-500/40 text-blue-400 hover:border-blue-400'
            }`}
            title="Cross: Jump & Super Vault"
          >
            <span className="text-2xl font-black text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">
              ✕
            </span>
            <span className="text-[8px] font-bold text-blue-200 uppercase -mt-1">JUMP</span>
          </button>

          {/* ======================================================== */}
          {/* SQUARE (▢) - Left: Web Strike / Attack / Punch */}
          {/* ======================================================== */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('ps_square', 'attack');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('ps_square', 'attack');
            }}
            onMouseDown={() => handleButtonDown('ps_square', 'attack')}
            onMouseUp={() => handleButtonUp('ps_square', 'attack')}
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-15 h-15 rounded-full border-2 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl transition-all duration-75 ${
              activeButtons['ps_square']
                ? 'bg-pink-500/70 border-pink-300 scale-90 shadow-pink-500/60'
                : 'bg-neutral-950/35 border-pink-500/40 text-pink-400 hover:border-pink-400'
            }`}
            title="Square: Web Strike & Attack"
          >
            <span className="text-2xl font-black text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]">
              ▢
            </span>
            <span className="text-[8px] font-bold text-pink-200 uppercase -mt-1">HIT</span>
          </button>

          {/* Center Supersonic Web Dash (R3 Burst) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('dash_btn', 'dash');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('dash_btn', 'dash');
            }}
            className={`w-12 h-12 rounded-full border backdrop-blur-md flex flex-col items-center justify-center shadow-xl transition-all duration-75 ${
              activeButtons['dash_btn']
                ? 'bg-cyan-500/70 border-cyan-300 scale-90 shadow-cyan-500/60'
                : 'bg-neutral-900/45 border-cyan-400/40 text-cyan-300'
            }`}
            title="Supersonic Web Dash Burst"
          >
            <span className="text-xs font-black text-cyan-300">⚡</span>
            <span className="text-[7px] font-black text-cyan-200 uppercase">DASH</span>
          </button>
        </div>
      </div>
    </div>
  );
}
