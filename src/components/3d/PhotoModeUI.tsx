import { useState, useMemo } from 'react';
import {
  Camera,
  ArrowLeft,
  Sliders,
  Sparkles,
  Grid,
  Image as ImageIcon,
  RotateCcw,
  Check,
  Download,
  Eye,
  SlidersHorizontal,
  Newspaper,
  Sun,
  X,
} from 'lucide-react';
import {
  PhotoSettings,
  PhotoModePose,
  PhotoFilterType,
  PhotoFrameType,
  PhotoStickerType,
  SavedPhoto,
  WeatherType,
  LiveWeatherReport,
} from './CityTypes';
import { SoundEffect } from '../../hooks/useAudio';
import { JJJ_MOVIE_QUOTES } from '../../utils/realtimeWeather';

interface PhotoModeUIProps {
  settings: PhotoSettings;
  weather: WeatherType;
  suitName: string;
  weatherReport?: LiveWeatherReport | null;
  onUpdateSettings: (newSettings: Partial<PhotoSettings>) => void;
  onClose: () => void;
  onOpenGallery: () => void;
  playSound: (sound: SoundEffect) => void;
  onSavePhoto: (photo: SavedPhoto) => void;
}

export default function PhotoModeUI({
  settings,
  weather,
  suitName,
  weatherReport,
  onUpdateSettings,
  onClose,
  onOpenGallery,
  playSound,
  onSavePhoto,
}: PhotoModeUIProps) {
  const [activeTab, setActiveTab] = useState<'filters' | 'camera' | 'pose' | 'frames'>('filters');
  const [isFlashing, setIsFlashing] = useState(false);
  const [lastCaptured, setLastCaptured] = useState<SavedPhoto | null>(null);

  // Available camera filters with specific focus on Sepia, High Contrast, Black and White
  const filterOptions: {
    id: PhotoFilterType;
    label: string;
    description: string;
    badge?: string;
    previewBg: string;
  }[] = useMemo(
    () => [
      {
        id: 'none',
        label: 'Natural (No Filter)',
        description: 'True-to-life Manhattan daylight & reflections',
        previewBg: 'bg-neutral-800',
      },
      {
        id: 'sepia',
        label: 'Sepia',
        description: 'Warm vintage parchment & golden nostalgic glow',
        badge: 'CLASSIC',
        previewBg: 'bg-amber-900',
      },
      {
        id: 'high_contrast',
        label: 'High Contrast',
        description: 'Vibrant punchy colors & deep cinematic shadows',
        badge: 'VIVID',
        previewBg: 'bg-red-950',
      },
      {
        id: 'black_and_white',
        label: 'Black & White',
        description: 'Clean monochrome silver tone & architectural lines',
        badge: 'TIMELESS',
        previewBg: 'bg-neutral-900',
      },
      {
        id: 'noir',
        label: 'Noir Grit',
        description: 'Heavy moody shadows & crime-thriller gloom',
        previewBg: 'bg-neutral-950',
      },
      {
        id: 'comic',
        label: 'Comic Book',
        description: 'Saturated halftone print style & pop inks',
        previewBg: 'bg-blue-900',
      },
      {
        id: 'golden',
        label: 'Golden Hour',
        description: 'Sunset Manhattan skyline rays & warm backlight',
        previewBg: 'bg-yellow-900',
      },
      {
        id: 'cyberpunk',
        label: 'Cyberpunk Neon',
        description: 'Neon magenta & electric cyan night shift',
        previewBg: 'bg-purple-950',
      },
    ],
    []
  );

  const poses: { id: PhotoModePose; label: string; icon: string }[] = [
    { id: 'action', label: 'Mid-Air Thwip', icon: '🕸️' },
    { id: 'crouch', label: 'Gargoyle Crouch', icon: '🧗' },
    { id: 'heroic', label: 'Heroic Stance', icon: '🦸' },
    { id: 'hang', label: 'Inverted Hang', icon: '🙃' },
    { id: 'thwip', label: 'Dual Web-Shoot', icon: '⚡' },
    { id: 'selfie', label: 'Manhattan Selfie', icon: '📱' },
  ];

  const frames: { id: PhotoFrameType; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'bugle', label: 'Daily Bugle Front Page' },
    { id: 'cinematic', label: '2.39:1 Cinema Letterbox' },
    { id: 'comic_panel', label: 'Comic Panel' },
    { id: 'polaroid', label: 'Polaroid Instant' },
  ];

  const stickers: { id: PhotoStickerType; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'bugle_stamp', label: 'Bugle Exclusive' },
    { id: 'thwip', label: 'THWIP!' },
    { id: 'boom', label: 'BOOM!' },
  ];

  // Capture photograph from Three.js canvas & composite decorations
  const handleTakePhoto = () => {
    playSound('shutter');
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      if (!canvas) return;

      const offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      // 1. Draw base 3D canvas with selected filter
      if (settings.filter === 'sepia') {
        ctx.filter = 'sepia(90%) contrast(115%) brightness(1.02)';
      } else if (settings.filter === 'high_contrast') {
        ctx.filter = 'contrast(185%) saturate(145%) brightness(1.05)';
      } else if (settings.filter === 'black_and_white') {
        ctx.filter = 'grayscale(100%) contrast(125%) brightness(1.05)';
      } else if (settings.filter === 'noir') {
        ctx.filter = 'grayscale(100%) contrast(155%) brightness(0.9)';
      } else if (settings.filter === 'comic') {
        ctx.filter = 'contrast(160%) saturate(160%)';
      } else if (settings.filter === 'cyberpunk') {
        ctx.filter = 'hue-rotate(180deg) saturate(190%)';
      } else if (settings.filter === 'golden') {
        ctx.filter = 'sepia(35%) saturate(170%) brightness(1.05)';
      } else {
        ctx.filter = 'none';
      }

      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';

      // 2. Vignette
      if (settings.vignette) {
        const radGrad = ctx.createRadialGradient(
          offscreen.width / 2,
          offscreen.height / 2,
          offscreen.width * 0.25,
          offscreen.width / 2,
          offscreen.height / 2,
          offscreen.width * 0.7
        );
        radGrad.addColorStop(0, 'rgba(0,0,0,0)');
        radGrad.addColorStop(1, 'rgba(0,0,0,0.65)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, offscreen.width, offscreen.height);
      }

      // 3. Frames
      if (settings.frame === 'bugle') {
        // Daily Bugle Newspaper Front Page frame with real-time weather & JJJ quote
        const topBannerH = offscreen.height * 0.18;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(0, 0, offscreen.width, topBannerH);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, offscreen.width, topBannerH);

        ctx.fillStyle = '#000000';
        ctx.font = `900 ${Math.round(topBannerH * 0.42)}px Impact, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('THE DAILY BUGLE', offscreen.width / 2, topBannerH * 0.48);

        const jjjHeadline = weatherReport?.jjjReport?.headline || 'SPIDER-MAN: THREAT OR MENACE?!';
        ctx.font = `bold ${Math.round(topBannerH * 0.18)}px sans-serif`;
        ctx.fillText(jjjHeadline, offscreen.width / 2, topBannerH * 0.76);

        // Date & Weather Banner Subhead
        const subtext = `${weatherReport?.dateStr || new Date().toDateString()} • Weather: ${weather.toUpperCase()} • 75¢`;
        ctx.font = `italic ${Math.round(topBannerH * 0.13)}px serif`;
        ctx.fillText(subtext, offscreen.width / 2, topBannerH * 0.93);

        // Border around photo
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(0, 0, offscreen.width, offscreen.height);

        // Bottom quote footer
        const bottomH = offscreen.height * 0.08;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(0, offscreen.height - bottomH, offscreen.width, bottomH);
        ctx.fillStyle = '#000000';
        ctx.font = `bold italic ${Math.round(bottomH * 0.35)}px serif`;
        const quote = weatherReport?.jjjReport?.quote?.quote || 'He is a menace to the entire city! — J. Jonah Jameson';
        ctx.fillText(`"${quote.slice(0, 70)}..." — J. Jonah Jameson`, offscreen.width / 2, offscreen.height - bottomH * 0.35);
      } else if (settings.frame === 'cinematic') {
        const barHeight = offscreen.height * 0.12;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, offscreen.width, barHeight);
        ctx.fillRect(0, offscreen.height - barHeight, offscreen.width, barHeight);

        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${Math.round(offscreen.height * 0.035)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('NEW YORK CITY • THE AMAZING SPIDER-MAN', offscreen.width / 2, offscreen.height - barHeight * 0.4);
      } else if (settings.frame === 'polaroid') {
        const border = Math.round(offscreen.width * 0.04);
        const bottomBorder = Math.round(offscreen.height * 0.16);
        ctx.lineWidth = border * 2;
        ctx.strokeStyle = '#f8fafc';
        ctx.strokeRect(0, 0, offscreen.width, offscreen.height);

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, offscreen.height - bottomBorder, offscreen.width, bottomBorder);

        ctx.fillStyle = '#1e293b';
        ctx.font = `italic bold ${Math.round(bottomBorder * 0.35)}px cursive, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Friendly Neighborhood Spider-Man ❤️', offscreen.width / 2, offscreen.height - bottomBorder * 0.35);
      } else if (settings.frame === 'comic_panel') {
        ctx.lineWidth = Math.round(offscreen.width * 0.02);
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(0, 0, offscreen.width, offscreen.height);

        const boxW = offscreen.width * 0.45;
        const boxH = offscreen.height * 0.09;
        ctx.fillStyle = '#fde047';
        ctx.fillRect(15, 15, boxW, boxH);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(15, 15, boxW, boxH);

        ctx.fillStyle = '#000000';
        ctx.font = `900 italic ${Math.round(boxH * 0.38)}px Impact, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText('MEANWHILE, OVER MANHATTAN...', 25, 15 + boxH * 0.65);
      }

      // 4. Stickers
      if (settings.sticker === 'bugle_stamp') {
        ctx.save();
        ctx.translate(offscreen.width * 0.84, offscreen.height * 0.82);
        ctx.rotate(-0.15);
        ctx.fillStyle = 'rgba(220, 38, 38, 0.92)';
        ctx.fillRect(-offscreen.width * 0.12, -offscreen.height * 0.035, offscreen.width * 0.24, offscreen.height * 0.07);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(-offscreen.width * 0.12, -offscreen.height * 0.035, offscreen.width * 0.24, offscreen.height * 0.07);

        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${Math.round(offscreen.width * 0.02)}px Impact, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('BUGLE EXCLUSIVE', 0, offscreen.height * 0.012);
        ctx.restore();
      } else if (settings.sticker === 'thwip') {
        ctx.save();
        ctx.translate(offscreen.width * 0.82, offscreen.height * 0.28);
        ctx.rotate(-0.2);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.ellipse(0, 0, offscreen.width * 0.11, offscreen.height * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `900 italic ${Math.round(offscreen.width * 0.042)}px Impact, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('THWIP!', 0, offscreen.height * 0.015);
        ctx.restore();
      }

      const photoUrl = offscreen.toDataURL('image/png');
      const newPhoto: SavedPhoto = {
        id: `photo_${Date.now()}`,
        dataUrl: photoUrl,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        weather,
        suitName,
        filter: settings.filter,
        caption: `${suitName} overlooking NYC with ${settings.filter.replace('_', ' ')} filter in ${weather} weather`,
      };

      onSavePhoto(newPhoto);
      setLastCaptured(newPhoto);
    } catch (err) {
      console.error('Failed to take photo:', err);
    }
  };

  const handleDownload = (photo: SavedPhoto) => {
    const link = document.createElement('a');
    link.download = `spiderman_photo_${Date.now()}.png`;
    link.href = photo.dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-between select-none">
      {/* Flash Effect on Capture */}
      {isFlashing && (
        <div className="fixed inset-0 bg-white pointer-events-none z-50 transition-opacity duration-300 opacity-90" />
      )}

      {/* Rule of Thirds Grid Overlay */}
      {settings.showGrid && (
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 border border-white/20">
          <div className="border-r border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-b border-white/20" />
          <div className="border-r border-white/20" />
          <div className="border-r border-white/20" />
          <div />
        </div>
      )}

      {/* Viewfinder Corners */}
      <div className="absolute inset-8 pointer-events-none z-10 border border-white/10">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500" />
      </div>

      {/* TOP BAR: Return to Game Button & Camera Stats */}
      <div className="pointer-events-auto flex items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-black/95 via-black/70 to-transparent z-20">
        {/* RETURN TO GAME TOGGLE BUTTON */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 border border-yellow-300/60 rounded-xl text-white font-sans font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(239,68,68,0.5)] transition active:scale-95 group cursor-pointer"
          title="Return to Spider-Man Free Exploration [ESC / P]"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>RETURN TO GAME</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-black/40 text-yellow-200 rounded text-[10px] font-mono">
            ESC / P
          </kbd>
        </button>

        {/* Center: Live Specs & Active Filter Indicator */}
        <div className="hidden sm:flex items-center gap-3 bg-neutral-950/85 border border-neutral-800 px-4 py-1.5 rounded-full text-xs font-mono text-neutral-300 backdrop-blur-md">
          <span className="text-red-400 font-bold flex items-center gap-1">
            <Camera size={13} />
            PHOTO MODE
          </span>
          <span className="text-neutral-600">•</span>
          <span className="text-amber-400 font-bold uppercase">
            FILTER: {settings.filter.replace('_', ' ')}
          </span>
          <span className="text-neutral-600">•</span>
          <span>FOV: {settings.fov}°</span>
          <span className="text-neutral-600">•</span>
          <span className="text-sky-300 uppercase">{weather}</span>
        </div>

        {/* Right: Quick Tools & Gallery Button */}
        <div className="flex items-center gap-2">
          {/* Grid Toggle */}
          <button
            onClick={() => onUpdateSettings({ showGrid: !settings.showGrid })}
            className={`p-2 rounded-xl border transition ${
              settings.showGrid
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-neutral-900/90 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
            title="Toggle Rule of Thirds Grid"
          >
            <Grid size={16} />
          </button>

          {/* Reset View */}
          <button
            onClick={() =>
              onUpdateSettings({
                fov: 65,
                distance: 12,
                height: 0,
                orbitAngle: 0,
                tilt: 0,
                pose: 'action',
              })
            }
            className="p-2 rounded-xl border bg-neutral-900/90 text-neutral-400 border-neutral-700 hover:text-white transition"
            title="Reset Camera Angles"
          >
            <RotateCcw size={16} />
          </button>

          {/* Gallery Button */}
          <button
            onClick={onOpenGallery}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900/90 border border-neutral-700 hover:border-sky-500 text-sky-400 hover:text-white rounded-xl text-xs font-bold transition shadow-lg"
          >
            <ImageIcon size={15} />
            <span>Gallery</span>
          </button>
        </div>
      </div>

      {/* Captured Photo Notification Toast */}
      {lastCaptured && (
        <div className="self-center pointer-events-auto flex items-center gap-3 bg-neutral-900/95 border-2 border-amber-400 p-3 rounded-2xl shadow-2xl backdrop-blur-md animate-bounce z-40 max-w-lg mx-4">
          <img
            src={lastCaptured.dataUrl}
            alt="Captured preview"
            className="w-16 h-14 object-cover rounded-lg border border-neutral-700 shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-extrabold text-amber-400 font-sans tracking-wide">
              📸 PHOTO SAVED TO GALLERY!
            </span>
            <span className="text-[11px] text-neutral-300 truncate font-sans">
              {lastCaptured.caption}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Filter: {lastCaptured.filter.toUpperCase()}
            </span>
          </div>
          <button
            onClick={() => handleDownload(lastCaptured)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1 transition shrink-0 ml-auto"
          >
            <Download size={13} /> Save
          </button>
          <button
            onClick={() => setLastCaptured(null)}
            className="text-neutral-500 hover:text-white text-xs p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* BOTTOM CONTROLS DOCK: Filters, Shutter & Controls Drawer */}
      <div className="pointer-events-auto flex flex-col items-center gap-3 p-3 sm:p-5 bg-gradient-to-t from-black/95 via-black/85 to-transparent z-20">
        {/* SHUTTER & RETURN-TO-GAME CENTER COMMAND */}
        <div className="flex items-center gap-6">
          {/* Secondary Return Button */}
          <button
            onClick={onClose}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition active:scale-95"
          >
            <ArrowLeft size={14} />
            <span>Resume Roaming</span>
          </button>

          {/* CAPTURE BUTTON */}
          <button
            onClick={handleTakePhoto}
            className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 shadow-[0_0_35px_rgba(239,68,68,0.7)] hover:scale-105 active:scale-95 transition cursor-pointer"
            title="Take Photo [SPACEBAR]"
          >
            <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-red-600 group-hover:bg-red-500 transition shadow-inner">
              <Camera size={28} className="text-white group-hover:scale-110 transition" />
            </div>
            <span className="absolute -bottom-5 text-[9px] tracking-widest text-neutral-300 font-mono font-bold">
              [SPACE] CAPTURE
            </span>
          </button>

          {/* Daily Bugle Quick Stamp */}
          <button
            onClick={() =>
              onUpdateSettings({
                frame: settings.frame === 'bugle' ? 'none' : 'bugle',
              })
            }
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition active:scale-95 ${
              settings.frame === 'bugle'
                ? 'bg-amber-600 border-yellow-300 text-white shadow-lg'
                : 'bg-neutral-900/90 hover:bg-neutral-800 border-neutral-700 text-amber-400'
            }`}
            title="Toggle Daily Bugle Front Page Frame"
          >
            <Newspaper size={14} />
            <span>Bugle Cover</span>
          </button>
        </div>

        {/* Tab Navigation: Filters | Camera | Pose | Frames */}
        <div className="flex items-center bg-neutral-900/90 border border-neutral-800 p-1 rounded-2xl backdrop-blur-md text-xs font-sans font-bold shadow-lg">
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'filters'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye size={14} />
            <span>Camera Filters</span>
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'camera'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Lens & Angle</span>
          </button>
          <button
            onClick={() => setActiveTab('pose')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'pose'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Spider-Man Pose</span>
          </button>
          <button
            onClick={() => setActiveTab('frames')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'frames'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Newspaper size={14} />
            <span>Daily Bugle Frames</span>
          </button>
        </div>

        {/* CONTROLS DRAWER PANEL */}
        <div className="w-full max-w-3xl bg-neutral-950/95 border border-neutral-800 p-3.5 sm:p-4 rounded-2xl backdrop-blur-md shadow-2xl text-xs font-sans max-h-56 overflow-y-auto">
          {/* 1. CAMERA FILTERS TAB (Sepia, High Contrast, Black and White, etc.) */}
          {activeTab === 'filters' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-300 font-bold">
                  Select Visual Filter (Live Viewport Preview):
                </span>
                <span className="text-[11px] text-amber-400 font-mono">
                  Active: {settings.filter.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* FILTER BUTTONS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {filterOptions.map((f) => {
                  const isSelected = settings.filter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => onUpdateSettings({ filter: f.id })}
                      className={`flex flex-col p-2.5 rounded-xl border transition text-left relative overflow-hidden group cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-amber-600/90 to-red-600/90 border-yellow-300 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-extrabold text-xs sm:text-sm">{f.label}</span>
                        {f.badge && (
                          <span className="text-[9px] bg-black/60 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                            {f.badge}
                          </span>
                        )}
                        {isSelected && <Check size={14} className="text-white shrink-0 ml-1" />}
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-tight group-hover:text-neutral-200">
                        {f.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. CAMERA LENS & ANGLE CONTROLS */}
          {activeTab === 'camera' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between text-neutral-300 font-bold mb-1">
                  <span>Field of View (FOV)</span>
                  <span className="text-amber-400">{settings.fov}°</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="90"
                  value={settings.fov}
                  onChange={(e) => onUpdateSettings({ fov: Number(e.target.value) })}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-300 font-bold mb-1">
                  <span>Camera Distance</span>
                  <span className="text-amber-400">{settings.distance}m</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="28"
                  value={settings.distance}
                  onChange={(e) => onUpdateSettings({ distance: Number(e.target.value) })}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-300 font-bold mb-1">
                  <span>Orbit Angle</span>
                  <span className="text-amber-400">{settings.orbitAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={settings.orbitAngle}
                  onChange={(e) => onUpdateSettings({ orbitAngle: Number(e.target.value) })}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-300 font-bold mb-1">
                  <span>Camera Elevation</span>
                  <span className="text-amber-400">{settings.height}m</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="8"
                  value={settings.height}
                  onChange={(e) => onUpdateSettings({ height: Number(e.target.value) })}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-300 font-bold mb-1">
                  <span>Dutch Tilt</span>
                  <span className="text-amber-400">{settings.tilt}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={settings.tilt}
                  onChange={(e) => onUpdateSettings({ tilt: Number(e.target.value) })}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-neutral-300 font-bold">Lens Vignette</span>
                <button
                  onClick={() => onUpdateSettings({ vignette: !settings.vignette })}
                  className={`px-3 py-1 rounded-lg border font-bold text-xs ${
                    settings.vignette
                      ? 'bg-amber-500 text-neutral-950 border-amber-400'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {settings.vignette ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}

          {/* 3. SPIDER-MAN POSES */}
          {activeTab === 'pose' && (
            <div>
              <div className="text-neutral-400 mb-2 font-medium">
                Select Spider-Man pose in the frozen snapshot:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {poses.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onUpdateSettings({ pose: p.id })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition text-left cursor-pointer ${
                      settings.pose === p.id
                        ? 'bg-red-600/90 border-red-400 text-white shadow-lg'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    <span className="font-bold">{p.label}</span>
                    {settings.pose === p.id && <Check size={14} className="ml-auto text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. FRAMES & STICKERS */}
          {activeTab === 'frames' && (
            <div className="space-y-3">
              <div>
                <span className="text-neutral-300 font-bold block mb-1.5">
                  Newspaper & Comic Frames:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {frames.map((fr) => (
                    <button
                      key={fr.id}
                      onClick={() => onUpdateSettings({ frame: fr.id })}
                      className={`p-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                        settings.frame === fr.id
                          ? 'bg-red-600 border-red-400 text-white shadow-md'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {fr.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-neutral-300 font-bold block mb-1.5">Action Stickers:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {stickers.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => onUpdateSettings({ sticker: st.id })}
                      className={`p-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                        settings.sticker === st.id
                          ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
