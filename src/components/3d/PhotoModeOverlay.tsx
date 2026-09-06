import { useState } from 'react';
import {
  Camera,
  X,
  Sliders,
  Sparkles,
  Grid,
  Image as ImageIcon,
  RotateCcw,
  Check,
  Download,
  Eye,
} from 'lucide-react';
import {
  PhotoSettings,
  PhotoModePose,
  PhotoFilterType,
  PhotoFrameType,
  PhotoStickerType,
  SavedPhoto,
  WeatherType,
} from './CityTypes';
import { SoundEffect } from '../../hooks/useAudio';

interface PhotoModeOverlayProps {
  settings: PhotoSettings;
  weather: WeatherType;
  suitName: string;
  onUpdateSettings: (newSettings: Partial<PhotoSettings>) => void;
  onClose: () => void;
  onOpenGallery: () => void;
  playSound: (sound: SoundEffect) => void;
  onSavePhoto: (photo: SavedPhoto) => void;
}

export default function PhotoModeOverlay({
  settings,
  weather,
  suitName,
  onUpdateSettings,
  onClose,
  onOpenGallery,
  playSound,
  onSavePhoto,
}: PhotoModeOverlayProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'pose' | 'filter' | 'frame'>('camera');
  const [isFlashing, setIsFlashing] = useState(false);
  const [lastCaptured, setLastCaptured] = useState<SavedPhoto | null>(null);

  // Capture photograph from Three.js canvas & composite decorations
  const handleTakePhoto = () => {
    playSound('shutter');
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      if (!canvas) return;

      // Create composite offscreen canvas to bake in frame & stickers
      const offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      // 1. Draw base 3D canvas with filter
      if (settings.filter === 'noir') ctx.filter = 'grayscale(100%) contrast(140%)';
      else if (settings.filter === 'sepia') ctx.filter = 'sepia(90%) contrast(120%)';
      else if (settings.filter === 'comic') ctx.filter = 'contrast(160%) saturate(160%)';
      else if (settings.filter === 'cyberpunk') ctx.filter = 'hue-rotate(180deg) saturate(190%)';
      else if (settings.filter === 'golden') ctx.filter = 'sepia(35%) saturate(170%) brightness(1.05)';
      else if (settings.filter === 'popart') ctx.filter = 'saturate(250%) contrast(140%)';

      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';

      // 2. Draw Vignette if enabled
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

      // 3. Draw Frames
      if (settings.frame === 'cinematic') {
        const barHeight = offscreen.height * 0.12;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, offscreen.width, barHeight);
        ctx.fillRect(0, offscreen.height - barHeight, offscreen.width, barHeight);

        // Subtitle text
        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${Math.round(offscreen.height * 0.035)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('NEW YORK CITY • THE AMAZING SPIDER-MAN', offscreen.width / 2, offscreen.height - barHeight * 0.4);
      } else if (settings.frame === 'bugle') {
        // Daily Bugle Newspaper banner header
        const topBannerH = offscreen.height * 0.16;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(0, 0, offscreen.width, topBannerH);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, offscreen.width, topBannerH);

        ctx.fillStyle = '#000000';
        ctx.font = `900 ${Math.round(topBannerH * 0.45)}px Impact, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('THE DAILY BUGLE', offscreen.width / 2, topBannerH * 0.52);

        ctx.font = `bold ${Math.round(topBannerH * 0.22)}px sans-serif`;
        ctx.fillText('SPIDER-MAN MENACE OR HERO?! • NYC EXCLUSIVE', offscreen.width / 2, topBannerH * 0.85);

        // Border around photo
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(0, 0, offscreen.width, offscreen.height);
      } else if (settings.frame === 'comic_panel') {
        ctx.lineWidth = Math.round(offscreen.width * 0.02);
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(0, 0, offscreen.width, offscreen.height);

        // Yellow caption box
        const boxW = offscreen.width * 0.4;
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
      }

      // 4. Draw Stickers
      if (settings.sticker === 'thwip') {
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
      } else if (settings.sticker === 'boom') {
        ctx.save();
        ctx.translate(offscreen.width * 0.82, offscreen.height * 0.28);
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, 0, offscreen.width * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#dc2626';
        ctx.stroke();

        ctx.fillStyle = '#dc2626';
        ctx.font = `900 italic ${Math.round(offscreen.width * 0.04)}px Impact, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('BOOM!', 0, offscreen.height * 0.015);
        ctx.restore();
      } else if (settings.sticker === 'bugle_stamp') {
        ctx.save();
        ctx.translate(offscreen.width * 0.84, offscreen.height * 0.82);
        ctx.rotate(-0.15);
        ctx.fillStyle = 'rgba(220, 38, 38, 0.9)';
        ctx.fillRect(-offscreen.width * 0.12, -offscreen.height * 0.035, offscreen.width * 0.24, offscreen.height * 0.07);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(-offscreen.width * 0.12, -offscreen.height * 0.035, offscreen.width * 0.24, offscreen.height * 0.07);

        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${Math.round(offscreen.width * 0.02)}px Impact, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('BUGLE EXCLUSIVE', 0, offscreen.height * 0.012);
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
        caption: `${suitName} overlooking NYC in ${weather} weather`,
      };

      onSavePhoto(newPhoto);
      setLastCaptured(newPhoto);
    } catch {
      // Error handling
    }
  };

  // Quick download helper
  const handleDownload = (photo: SavedPhoto) => {
    const link = document.createElement('a');
    link.download = `spiderman_${photo.weather}_${Date.now()}.png`;
    link.href = photo.dataUrl;
    link.click();
    playSound('pickup');
  };

  const poses: { id: PhotoModePose; label: string; icon: string }[] = [
    { id: 'action', label: 'Action Freeze', icon: '⚡' },
    { id: 'crouch', label: 'Classic Crouch', icon: '🕷️' },
    { id: 'thwip', label: 'Web Thwip', icon: '🕸️' },
    { id: 'hang', label: 'Upside Down', icon: '🙃' },
    { id: 'heroic', label: 'Heroic Stand', icon: '🦸' },
    { id: 'selfie', label: 'Peace Selfie', icon: '✌️' },
  ];

  const filters: { id: PhotoFilterType; label: string; desc: string }[] = [
    { id: 'none', label: 'Natural', desc: 'NYC Natural' },
    { id: 'noir', label: 'Noir Comic', desc: 'B&W Contrast' },
    { id: 'comic', label: 'Comic Print', desc: 'Bold Colors' },
    { id: 'sepia', label: '1930s Sepia', desc: 'Vintage Classic' },
    { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Neon Manhattan' },
    { id: 'golden', label: 'Golden Hour', desc: 'Sunset Warmth' },
    { id: 'popart', label: 'Pop Art', desc: 'High Saturation' },
  ];

  const frames: { id: PhotoFrameType; label: string }[] = [
    { id: 'none', label: 'No Frame' },
    { id: 'bugle', label: 'Daily Bugle' },
    { id: 'comic_panel', label: 'Comic Panel' },
    { id: 'cinematic', label: 'Cinematic 2.39:1' },
    { id: 'polaroid', label: 'Polaroid' },
  ];

  const stickers: { id: PhotoStickerType; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'thwip', label: 'THWIP! Badge' },
    { id: 'boom', label: 'BOOM! Comic' },
    { id: 'bugle_stamp', label: 'Bugle Exclusive' },
  ];

  return (
    <div className="absolute inset-0 select-none z-30 pointer-events-none flex flex-col justify-between overflow-hidden">
      {/* Flash shutter animation */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-300 opacity-90 animate-pulse" />
      )}

      {/* Dynamic CSS filter preview on canvas wrapper */}
      <style>{`
        ${settings.filter === 'noir' ? 'canvas { filter: grayscale(100%) contrast(140%); }' : ''}
        ${settings.filter === 'sepia' ? 'canvas { filter: sepia(90%) contrast(120%); }' : ''}
        ${settings.filter === 'comic' ? 'canvas { filter: contrast(160%) saturate(160%); }' : ''}
        ${settings.filter === 'cyberpunk' ? 'canvas { filter: hue-rotate(180deg) saturate(180%); }' : ''}
        ${settings.filter === 'golden' ? 'canvas { filter: sepia(35%) saturate(170%) brightness(1.05); }' : ''}
        ${settings.filter === 'popart' ? 'canvas { filter: saturate(250%) contrast(140%); }' : ''}
      `}</style>

      {/* Rule of Thirds Viewfinder Grid */}
      {settings.showGrid && (
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 opacity-30">
          <div className="border-r border-b border-white/60"></div>
          <div className="border-r border-b border-white/60"></div>
          <div className="border-b border-white/60"></div>
          <div className="border-r border-b border-white/60"></div>
          <div className="border-r border-b border-white/60"></div>
          <div className="border-b border-white/60"></div>
          <div className="border-r border-white/60"></div>
          <div className="border-r border-white/60"></div>
          <div></div>
        </div>
      )}

      {/* Vignette Overlay */}
      {settings.vignette && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)] z-10" />
      )}

      {/* Frame Visual Overlay in Realtime Viewfinder */}
      {settings.frame === 'cinematic' && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10">
          <div className="w-full h-[12%] bg-black flex items-center justify-center">
            <span className="text-white/40 text-xs tracking-widest font-mono">CINEMATIC 2.39:1</span>
          </div>
          <div className="w-full h-[12%] bg-black flex items-center justify-center">
            <span className="text-white/80 text-sm font-semibold tracking-widest font-sans">
              NEW YORK CITY • THE AMAZING SPIDER-MAN
            </span>
          </div>
        </div>
      )}

      {settings.frame === 'bugle' && (
        <div className="absolute inset-0 pointer-events-none border-[12px] border-black flex flex-col justify-between z-10">
          <div className="w-full bg-yellow-300 border-b-4 border-black text-black py-2 px-6 flex flex-col items-center shadow-lg">
            <span className="font-['Impact',sans-serif] text-3xl md:text-5xl font-black tracking-wider">
              THE DAILY BUGLE
            </span>
            <span className="text-xs md:text-sm font-bold tracking-widest uppercase">
              SPIDER-MAN: HERO OR THREAT TO NYC?! • DAILY PHOTO BEAT
            </span>
          </div>
        </div>
      )}

      {settings.frame === 'comic_panel' && (
        <div className="absolute inset-0 pointer-events-none border-[16px] border-black z-10">
          <div className="absolute top-4 left-4 bg-yellow-300 text-black border-2 border-black px-4 py-1.5 font-['Impact',sans-serif] text-base md:text-xl italic shadow-md">
            MEANWHILE, OVER MANHATTAN...
          </div>
        </div>
      )}

      {settings.frame === 'polaroid' && (
        <div className="absolute inset-0 pointer-events-none border-[20px] border-neutral-100 flex flex-col justify-end z-10">
          <div className="w-full bg-neutral-100 text-neutral-800 py-4 flex justify-center">
            <span className="font-serif italic text-lg md:text-xl font-bold">
              Friendly Neighborhood Spider-Man ❤️
            </span>
          </div>
        </div>
      )}

      {/* Sticker Previews in Viewfinder */}
      {settings.sticker === 'thwip' && (
        <div className="absolute top-24 right-8 pointer-events-none z-10 bg-red-600 border-4 border-white px-5 py-2 rounded-full -rotate-12 shadow-2xl animate-pulse">
          <span className="font-['Impact',sans-serif] text-3xl text-white tracking-widest">
            THWIP!
          </span>
        </div>
      )}

      {settings.sticker === 'boom' && (
        <div className="absolute top-24 right-8 pointer-events-none z-10 bg-amber-400 border-4 border-red-600 px-6 py-2 rounded-full rotate-6 shadow-2xl">
          <span className="font-['Impact',sans-serif] text-3xl text-red-700 tracking-widest">
            BOOM!
          </span>
        </div>
      )}

      {settings.sticker === 'bugle_stamp' && (
        <div className="absolute bottom-40 right-8 pointer-events-none z-10 bg-red-600 border-2 border-white px-4 py-1.5 -rotate-6 shadow-2xl">
          <span className="font-['Impact',sans-serif] text-lg text-white tracking-widest uppercase">
            DAILY BUGLE EXCLUSIVE
          </span>
        </div>
      )}

      {/* TOP BAR: Viewfinder Header & Controls */}
      <div className="pointer-events-auto flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
        {/* Exit Photo Mode */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900/90 border border-neutral-700 hover:border-red-500 rounded-xl text-white font-sans font-medium text-sm transition shadow-xl"
        >
          <X size={18} className="text-red-400" />
          <span>Exit Photo Mode [ESC / P]</span>
        </button>

        {/* Center: Camera Telemetry Specs */}
        <div className="hidden sm:flex items-center gap-4 bg-neutral-950/80 border border-neutral-800 px-5 py-1.5 rounded-full text-xs font-mono text-neutral-300 backdrop-blur-md">
          <span className="text-red-400 font-bold">MANHATTAN CAM</span>
          <span className="text-neutral-600">•</span>
          <span>FOV: {settings.fov}°</span>
          <span className="text-neutral-600">•</span>
          <span>TILT: {settings.tilt}°</span>
          <span className="text-neutral-600">•</span>
          <span className="text-amber-400 font-bold uppercase">{weather}</span>
          <span className="text-neutral-600">•</span>
          <span>ISO 400</span>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Grid Toggle */}
          <button
            onClick={() => onUpdateSettings({ showGrid: !settings.showGrid })}
            className={`p-2.5 rounded-xl border transition ${
              settings.showGrid
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-neutral-900/90 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
            title="Toggle Rule of Thirds Grid"
          >
            <Grid size={18} />
          </button>

          {/* Reset Camera */}
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
            className="p-2.5 rounded-xl border bg-neutral-900/90 text-neutral-400 border-neutral-700 hover:text-white transition"
            title="Reset Camera Angles"
          >
            <RotateCcw size={18} />
          </button>

          {/* Open Gallery */}
          <button
            onClick={onOpenGallery}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900/90 border border-neutral-700 hover:border-sky-500 text-sky-400 hover:text-white rounded-xl text-sm transition"
          >
            <ImageIcon size={18} />
            <span className="hidden sm:inline">Gallery</span>
          </button>
        </div>
      </div>

      {/* Captured Photo Notification Toast */}
      {lastCaptured && (
        <div className="self-center pointer-events-auto flex items-center gap-4 bg-neutral-900/95 border border-amber-500/80 p-3 rounded-2xl shadow-2xl backdrop-blur-md animate-bounce z-40 max-w-md">
          <img
            src={lastCaptured.dataUrl}
            alt="Thumbnail"
            className="w-16 h-12 object-cover rounded-lg border border-neutral-700"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-amber-400 font-sans">
              📸 PHOTO SAVED TO GALLERY!
            </span>
            <span className="text-xs text-neutral-300 font-sans">
              {lastCaptured.caption}
            </span>
          </div>
          <button
            onClick={() => handleDownload(lastCaptured)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1 transition"
          >
            <Download size={14} /> Save
          </button>
          <button
            onClick={() => setLastCaptured(null)}
            className="text-neutral-500 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* BOTTOM CONTROLS DOCK */}
      <div className="pointer-events-auto flex flex-col items-center gap-3 p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
        {/* Shutter Button & Big Trigger */}
        <div className="flex items-center gap-6">
          {/* Shutter Button */}
          <button
            onClick={handleTakePhoto}
            className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:scale-105 active:scale-95 transition"
            title="Take Photo [SPACEBAR]"
          >
            <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-red-600 group-hover:bg-red-500 transition">
              <Camera size={28} className="text-white" />
            </div>
            <span className="absolute -bottom-6 text-[10px] tracking-widest text-neutral-400 font-mono">
              SPACEBAR
            </span>
          </button>
        </div>

        {/* Tab Selector: Camera | Pose | Filter | Frame */}
        <div className="flex items-center bg-neutral-900/90 border border-neutral-800 p-1 rounded-2xl backdrop-blur-md text-xs font-sans font-bold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition ${
              activeTab === 'camera'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sliders size={14} />
            <span>Camera</span>
          </button>
          <button
            onClick={() => setActiveTab('pose')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition ${
              activeTab === 'pose'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Pose</span>
          </button>
          <button
            onClick={() => setActiveTab('filter')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition ${
              activeTab === 'filter'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye size={14} />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setActiveTab('frame')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition ${
              activeTab === 'frame'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon size={14} />
            <span>Frame & Stickers</span>
          </button>
        </div>

        {/* Controls Drawer Content */}
        <div className="w-full max-w-2xl bg-neutral-950/90 border border-neutral-800 p-4 rounded-2xl backdrop-blur-md shadow-2xl text-xs font-sans">
          {/* TAB 1: Camera Controls */}
          {activeTab === 'camera' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Field of View (FOV) */}
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

              {/* Distance */}
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

              {/* Orbit Angle */}
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

              {/* Height Offset */}
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

              {/* Dutch Tilt / Roll */}
              <div>
                <div className="flex justify-between text-neutral-300 font-bold mb-1">
                  <span>Dutch Angle Tilt</span>
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

              {/* Vignette Toggle */}
              <div className="flex items-center justify-between pt-3">
                <span className="text-neutral-300 font-bold">Lens Vignette</span>
                <button
                  onClick={() => onUpdateSettings({ vignette: !settings.vignette })}
                  className={`px-3 py-1.5 rounded-lg border font-bold text-xs ${
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

          {/* TAB 2: Spider-Man Poses */}
          {activeTab === 'pose' && (
            <div>
              <div className="text-neutral-400 mb-2 font-medium">
                Select Spider-Man pose in the frozen moment:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {poses.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onUpdateSettings({ pose: p.id })}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition text-left ${
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

          {/* TAB 3: Visual Filters */}
          {activeTab === 'filter' && (
            <div>
              <div className="text-neutral-400 mb-2 font-medium">
                Color Grading & Comic Book Filters:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onUpdateSettings({ filter: f.id })}
                    className={`flex flex-col p-2.5 rounded-xl border transition text-left ${
                      settings.filter === f.id
                        ? 'bg-amber-600/90 border-amber-400 text-white shadow-lg'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <span className="font-bold text-sm">{f.label}</span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Frames & Stickers */}
          {activeTab === 'frame' && (
            <div className="space-y-4">
              <div>
                <span className="text-neutral-400 font-bold block mb-1.5">Newspaper & Comic Frames:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {frames.map((fr) => (
                    <button
                      key={fr.id}
                      onClick={() => onUpdateSettings({ frame: fr.id })}
                      className={`p-2 rounded-xl border text-center font-bold transition ${
                        settings.frame === fr.id
                          ? 'bg-red-600 border-red-400 text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {fr.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-neutral-400 font-bold block mb-1.5">Comic Action Stickers:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {stickers.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => onUpdateSettings({ sticker: st.id })}
                      className={`p-2 rounded-xl border text-center font-bold transition ${
                        settings.sticker === st.id
                          ? 'bg-amber-600 border-amber-400 text-white'
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
