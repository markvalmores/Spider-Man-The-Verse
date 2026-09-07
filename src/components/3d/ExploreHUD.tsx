import React, { useState, useEffect } from 'react';
import {
  CrimeMission,
  PlayerControls,
  WeatherType,
  BuildingData,
  PizzaPickup,
  PedestrianData,
  NearbyCitizenPrompt,
  ParkourState,
  CameraMode,
} from './CityTypes';
import {
  ArrowLeft,
  Compass,
  Crosshair,
  Shield,
  Zap,
  Sparkles,
  Camera,
  Sun,
  CloudRain,
  Snowflake,
  RefreshCw,
  Image as ImageIcon,
  Map as MapIcon,
  Video,
  Film,
  Gamepad2,
  Trophy,
  Award,
  Radio,
  Eye,
  EyeOff,
  Settings,
  Glasses,
  Users,
  Gift,
  Calendar,
} from 'lucide-react';
import { WEATHER_CONFIGS } from './WeatherSystem';
import CityMinimap from './CityMinimap';
import { SpiderGadgetBar, SpiderGadgetType, GADGET_DEFINITIONS } from './SpiderGadgetSystem';
import { CrimeRadioDispatch, CrimeIncident } from './CrimeRadioDispatch';
import { MultiplayerHubModal } from './MultiplayerHubModal';
import { SuitUltimatePowerHUD } from './SuitUltimatePowerSystem';

interface ExploreHUDProps {
  speed: number;
  altitude: number;
  playerPos: [number, number, number];
  playerRotY?: number;
  buildings: BuildingData[];
  pizzaCount: number;
  suitId?: string;
  suitName: string;
  activeMission: CrimeMission | null;
  pizzas: PizzaPickup[];
  pedestrians: PedestrianData[];
  notification: string | null;
  weather: WeatherType;
  autoCycleWeather: boolean;
  savedPhotosCount: number;
  nearbyCitizen: NearbyCitizenPrompt | null;
  heroKarma: number;
  parkourState?: ParkourState;
  cameraMode?: CameraMode;
  cinemaBars?: boolean;
  gamepadConnected?: boolean;
  isMobile?: boolean;
  spiderVisionActive?: boolean;
  suitPowerCharge?: number;
  suitPowerActive?: boolean;
  onToggleSpiderVision?: () => void;
  onActivateSuitPower?: () => void;
  glyphs?: {
    confirm: string;
    cancel: string;
    attack: string;
    special: string;
    stick: string;
    sprint: string;
    acrobat: string;
    swing: string;
    camera: string;
  };
  controllerBrand?: string;
  onOpenSettings?: () => void;
  showLiveBroadcast?: boolean;
  onToggleLiveBroadcast?: () => void;
  onOpenAchievements?: () => void;
  onOpenHolidayBonuses?: () => void;
  onInteractWithCitizen: () => void;
  onWeatherChange: (w: WeatherType) => void;
  onToggleAutoCycle: () => void;
  onOpenPhotoMode: () => void;
  onOpenGallery: () => void;
  onOpenLeaderboard?: () => void;
  onToggleCameraMode?: () => void;
  onToggleCinemaBars?: () => void;
  onClimbAction?: () => void;
  onControlChange: (key: keyof PlayerControls, val: boolean) => void;
  onExit: () => void;
  onOpenSuits: () => void;
}

export default function ExploreHUD({
  speed,
  altitude,
  playerPos,
  playerRotY = 0,
  buildings,
  pizzaCount,
  suitId = 'spider-man-2-classic',
  suitName,
  activeMission,
  pizzas,
  pedestrians,
  notification,
  weather,
  autoCycleWeather,
  savedPhotosCount,
  nearbyCitizen,
  heroKarma,
  parkourState = 'none',
  cameraMode = 'cinematic',
  cinemaBars = false,
  gamepadConnected = false,
  isMobile = false,
  spiderVisionActive = false,
  suitPowerCharge = 100,
  suitPowerActive = false,
  onToggleSpiderVision,
  onActivateSuitPower,
  glyphs = {
    confirm: '✕',
    cancel: '◯',
    attack: '▢',
    special: '△',
    stick: 'L1',
    sprint: 'R1',
    acrobat: 'L2',
    swing: 'R2',
    camera: 'R3',
  },
  controllerBrand = 'playstation',
  onOpenSettings,
  showLiveBroadcast = true,
  onToggleLiveBroadcast,
  onOpenAchievements,
  onOpenHolidayBonuses,
  onInteractWithCitizen,
  onWeatherChange,
  onToggleAutoCycle,
  onOpenPhotoMode,
  onOpenGallery,
  onOpenLeaderboard,
  onToggleCameraMode,
  onToggleCinemaBars,
  onClimbAction,
  onControlChange,
  onExit,
  onOpenSuits,
}: ExploreHUDProps) {
  const currentWeatherConfig = WEATHER_CONFIGS[weather];

  // Multiplayer & Co-Op State
  const [multiplayerHubOpen, setMultiplayerHubOpen] = useState(false);
  const [multiplayerEnabled, setMultiplayerEnabled] = useState(true);

  // Spider-Tech Gadgets State
  const [activeGadget, setActiveGadget] = useState<SpiderGadgetType>('web_shooter');
  const [gadgetCharges, setGadgetCharges] = useState<Record<SpiderGadgetType, number>>({
    web_shooter: 8,
    impact_web: 4,
    web_bomb: 3,
    electric_web: 4,
    suspension_matrix: 2,
  });

  // Police Radio Crime Dispatch Incident
  const [activeRadioIncident, setActiveRadioIncident] = useState<CrimeIncident | null>(null);

  // Keyboard shortcut for Gadgets [1, 2, 3, 4, 5]
  useEffect(() => {
    const handleGadgetKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') setActiveGadget('web_shooter');
      if (e.key === '2') setActiveGadget('impact_web');
      if (e.key === '3') setActiveGadget('web_bomb');
      if (e.key === '4') setActiveGadget('electric_web');
      if (e.key === '5') setActiveGadget('suspension_matrix');
    };
    window.addEventListener('keydown', handleGadgetKeyDown);
    return () => window.removeEventListener('keydown', handleGadgetKeyDown);
  }, []);

  const handleFireGadget = (gadget: SpiderGadgetType) => {
    setGadgetCharges((prev) => {
      const current = prev[gadget] ?? 1;
      if (current <= 1) {
        // Trigger reload cooldown
        setTimeout(() => {
          setGadgetCharges((p) => ({
            ...p,
            [gadget]: GADGET_DEFINITIONS[gadget].maxCharges,
          }));
        }, GADGET_DEFINITIONS[gadget].cooldownSec * 1000);
        return { ...prev, [gadget]: 0 };
      }
      return { ...prev, [gadget]: current - 1 };
    });
  };

  // Distance to active mission
  const missionDist = activeMission
    ? Math.round(
        Math.sqrt(
          Math.pow(playerPos[0] - activeMission.location[0], 2) +
            Math.pow(playerPos[1] - activeMission.location[1], 2) +
            Math.pow(playerPos[2] - activeMission.location[2], 2)
        )
      )
    : 0;

  // Hero Level calculation
  const heroLevel = Math.floor(heroKarma / 100) + 1;
  const heroTitle =
    heroLevel >= 4
      ? "Manhattan's Champion"
      : heroLevel >= 3
      ? 'Beloved Web-Head'
      : heroLevel >= 2
      ? 'Neighborhood Guardian'
      : 'Rookie Vigilante';

  return (
    <div className="absolute inset-0 pointer-events-none font-['Bangers'] text-white select-none z-20 overflow-hidden flex flex-col justify-between p-3 md:p-5">
      {/* 1. TOP HEADER BAR */}
      <div className="flex items-center justify-between w-full pointer-events-auto gap-2 flex-wrap">
        {/* Left: Return & Suit & Hero Karma */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Return Button */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 border border-neutral-700 hover:border-red-500 hover:bg-red-950/80 rounded-xl transition text-base tracking-wider shadow-lg"
          >
            <ArrowLeft size={16} className="text-red-400" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          {/* Suit Badge */}
          <div className="flex items-center gap-2.5 bg-neutral-900/85 border border-neutral-700 px-3 py-1.5 rounded-2xl backdrop-blur-sm shadow-xl">
            <button
              onClick={onOpenSuits}
              className="flex items-center gap-1.5 text-red-400 hover:text-white transition group"
              title="Change Suit"
            >
              <Shield size={15} className="text-red-500 group-hover:scale-110 transition" />
              <span className="text-sm tracking-wide">{suitName}</span>
            </button>
            <div className="w-px h-3.5 bg-neutral-700"></div>
            <div className="flex items-center gap-1 text-sky-400">
              <Compass size={14} />
              <span className="text-sm">{Math.max(0, Math.round(altitude))}m ALT</span>
            </div>
          </div>

          {/* NYC Hero Reputation Badge */}
          <div className="flex items-center gap-1.5 bg-neutral-900/85 border border-amber-500/50 px-3 py-1.5 rounded-2xl backdrop-blur-sm shadow-lg text-amber-400">
            <Sparkles size={14} className="text-yellow-400 animate-pulse" />
            <span className="text-sm font-bold tracking-wider">{heroKarma} KARMA</span>
            <span className="text-[10px] text-neutral-300 font-sans font-semibold border-l border-neutral-700 pl-1.5 hidden md:inline">
              LVL {heroLevel}: {heroTitle}
            </span>
          </div>
        </div>

        {/* Center: Dynamic Weather Switcher */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 bg-neutral-950/90 border border-neutral-700/80 px-2.5 py-1 rounded-2xl backdrop-blur-md shadow-xl text-xs font-sans font-bold">
            <span className="text-neutral-400 text-[10px] uppercase tracking-wider mr-1 hidden lg:inline">
              Weather:
            </span>

            {/* Clear Button */}
            <button
              onClick={() => onWeatherChange('clear')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition ${
                weather === 'clear'
                  ? 'bg-amber-500 text-neutral-950 shadow-md scale-105'
                  : 'text-neutral-300 hover:bg-neutral-800'
              }`}
              title="Manhattan Clear Daylight"
            >
              <Sun
                size={13}
                className={weather === 'clear' ? 'text-neutral-950' : 'text-amber-400'}
              />
              <span className="text-xs">Clear</span>
            </button>

            {/* Rain Button */}
            <button
              onClick={() => onWeatherChange('rain')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition ${
                weather === 'rain'
                  ? 'bg-sky-500 text-neutral-950 shadow-md scale-105'
                  : 'text-neutral-300 hover:bg-neutral-800'
              }`}
              title="Manhattan Storm Rain (Citizens deploy umbrellas!)"
            >
              <CloudRain
                size={13}
                className={weather === 'rain' ? 'text-neutral-950' : 'text-sky-400'}
              />
              <span className="text-xs">Rain</span>
            </button>

            {/* Snow Button */}
            <button
              onClick={() => onWeatherChange('snow')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition ${
                weather === 'snow'
                  ? 'bg-indigo-300 text-neutral-950 shadow-md scale-105'
                  : 'text-neutral-300 hover:bg-neutral-800'
              }`}
              title="Manhattan Winter Snow (Citizens wear beanies & shiver)"
            >
              <Snowflake
                size={13}
                className={weather === 'snow' ? 'text-neutral-950' : 'text-indigo-300'}
              />
              <span className="text-xs">Snow</span>
            </button>

            <div className="w-px h-3.5 bg-neutral-700 mx-0.5"></div>

            {/* Auto Cycle Toggle */}
            <button
              onClick={onToggleAutoCycle}
              className={`p-1.5 rounded-lg border transition ${
                autoCycleWeather
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
              }`}
              title={autoCycleWeather ? 'Weather Auto-Cycle: ACTIVE' : 'Weather Auto-Cycle: OFF'}
            >
              <RefreshCw size={12} className={autoCycleWeather ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Citizen AI Reaction Status Ribbon */}
          <div className="hidden xl:flex items-center gap-1.5 text-[10px] font-sans text-neutral-300 bg-black/70 px-3 py-0.5 rounded-full border border-neutral-800">
            <span className="text-amber-400 font-bold">{currentWeatherConfig.icon} Citizens:</span>
            <span>{currentWeatherConfig.pedestrianBehavior}</span>
          </div>
        </div>

        {/* Right: Multiplayer Hub, Spider-Vision, Camera Mode, Cinema Bars, Photo Mode, Gallery, Pizza Counter */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Spider-Vision AR Scanner Toggle Button */}
          {onToggleSpiderVision && (
            <button
              onClick={onToggleSpiderVision}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs sm:text-sm tracking-wider shadow-xl transition active:scale-95 group font-bold ${
                spiderVisionActive
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.8)] scale-105'
                  : 'bg-neutral-900/90 border-neutral-700 text-neutral-300 hover:text-cyan-300 hover:border-cyan-500'
              }`}
              title="Toggle Spider-Sense AR Scanner Hologram Overlay [Hotkey: T]"
            >
              <Eye size={15} className={spiderVisionActive ? 'text-cyan-300 animate-spin' : 'text-cyan-400'} />
              <span className="hidden sm:inline">SPIDER-VISION</span>
              <kbd className="px-1 py-0.2 bg-black/60 rounded text-[10px] font-mono text-cyan-200 border border-cyan-500/40">
                T
              </kbd>
            </button>
          )}

          {/* Multiplayer Co-Op Hub Button */}
          <button
            onClick={() => setMultiplayerHubOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/80 rounded-xl text-emerald-300 text-xs sm:text-sm tracking-wider shadow-xl transition active:scale-95 group font-bold"
            title="Open Live Multiplayer Co-Op Session & Spider-Radio"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <Users size={14} className="text-emerald-400 group-hover:scale-110 transition" />
            <span className="hidden sm:inline">4 CO-OP SPIDEYS</span>
          </button>

          {/* Live Broadcast Toggle Button */}
          {onToggleLiveBroadcast && (
            <button
              onClick={onToggleLiveBroadcast}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs sm:text-sm tracking-wider shadow-xl transition active:scale-95 group font-bold ${
                showLiveBroadcast
                  ? 'bg-red-950/80 border-red-500/60 text-yellow-300 hover:bg-red-900'
                  : 'bg-neutral-900/90 border-neutral-700 text-neutral-400 hover:text-white'
              }`}
              title={showLiveBroadcast ? 'Hide Live Broadcast' : 'Show Live Broadcast'}
            >
              <Radio size={14} className={showLiveBroadcast ? 'text-red-400 animate-pulse' : 'text-neutral-400'} />
              <span className="hidden lg:inline">{showLiveBroadcast ? 'HIDE BROADCAST' : 'SHOW BROADCAST'}</span>
            </button>
          )}

          {/* Achievements Button */}
          {onOpenAchievements && (
            <button
              onClick={onOpenAchievements}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 border border-yellow-200 rounded-xl text-neutral-950 font-black text-xs sm:text-sm tracking-wider shadow-xl transition active:scale-95 group animate-pulse"
              title="View Achievements & Claim Pizza Rewards"
            >
              <Award size={15} className="text-neutral-950 group-hover:scale-110 transition" />
              <span className="hidden sm:inline">ACHIEVEMENTS</span>
            </button>
          )}

          {/* Holiday & Occasions Pizza Bonuses Button */}
          {onOpenHolidayBonuses && (
            <button
              onClick={onOpenHolidayBonuses}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:brightness-110 border border-rose-300/80 rounded-xl text-white font-black text-xs sm:text-sm tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.4)] transition active:scale-95 group"
              title="Open Holiday & Occasion Pizza Calendar Bonuses"
            >
              <Gift size={15} className="text-yellow-300 group-hover:scale-110 transition animate-bounce" />
              <span className="hidden sm:inline">HOLIDAY BONUSES</span>
            </button>
          )}

          {/* Camera Mode Toggle Button */}
          {onToggleCameraMode && (
            <button
              onClick={onToggleCameraMode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 border border-sky-500/50 hover:border-sky-400 text-sky-300 rounded-xl text-xs sm:text-sm tracking-wider shadow-xl transition active:scale-95 group"
              title="Toggle Camera Mode: Cinematic / Action / Drone [Shortcut: V]"
            >
              <Video size={15} className="text-sky-400 group-hover:scale-110 transition" />
              <span className="hidden sm:inline font-bold">
                {cameraMode === 'cinematic' ? 'CINEMATIC' : cameraMode === 'action' ? 'ACTION' : 'DRONE'}
              </span>
              <kbd className="px-1 py-0.2 bg-black/50 text-sky-300 rounded text-[9px] font-mono">
                V
              </kbd>
            </button>
          )}

          {/* Anamorphic Cinema Bars Toggle */}
          {onToggleCinemaBars && (
            <button
              onClick={onToggleCinemaBars}
              className={`p-1.5 border rounded-xl transition ${
                cinemaBars
                  ? 'bg-amber-600/30 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-neutral-900/90 border-neutral-700 text-neutral-400 hover:text-white'
              }`}
              title="Toggle 2.39:1 Cinema Letterbox Bars"
            >
              <Film size={15} />
            </button>
          )}

          {/* Photo Mode Button */}
          <button
            onClick={onOpenPhotoMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 border border-yellow-300/40 rounded-xl text-white text-sm tracking-wider shadow-xl transition active:scale-95 group"
            title="Open Photo Mode [Shortcut: P]"
          >
            <Camera size={16} className="group-hover:scale-110 transition text-yellow-300" />
            <span className="hidden sm:inline">Photo</span>
            <kbd className="hidden md:inline px-1 py-0.2 bg-black/40 rounded text-[9px] font-mono">
              P
            </kbd>
          </button>

          {/* Realtime Leaderboard Button */}
          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:brightness-110 border border-yellow-300/60 rounded-xl text-neutral-950 font-black text-sm tracking-wider shadow-xl transition active:scale-95 group"
              title="Open Realtime Firestore Leaderboard"
            >
              <Trophy size={16} className="text-neutral-950 group-hover:scale-110 transition" />
              <span className="hidden sm:inline">RANK</span>
            </button>
          )}

          {/* Gallery Button */}
          <button
            onClick={onOpenGallery}
            className="relative p-1.5 bg-neutral-900/90 border border-neutral-700 hover:border-sky-500 text-sky-400 hover:text-white rounded-xl transition"
            title="Spider-Man Photo Archive"
          >
            <ImageIcon size={16} />
            {savedPhotosCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-sans font-bold">
                {savedPhotosCount}
              </span>
            )}
          </button>

          {/* Settings & Keybindings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 bg-neutral-900/90 border border-neutral-700 hover:border-red-500 text-neutral-300 hover:text-white rounded-xl transition shadow-xl active:scale-95"
              title="Open Settings, Controllers & Save Data"
            >
              <Settings size={16} />
            </button>
          )}

          {/* Pizza Currency Counter */}
          <div className="flex items-center gap-1.5 bg-neutral-900/90 border border-amber-600/40 px-2.5 py-1.5 rounded-xl text-base text-yellow-400 shadow-lg">
            <span>🍕</span>
            <span>{pizzaCount}</span>
          </div>
        </div>
      </div>

      {/* Anamorphic Cinema Bars (Top & Bottom letterbox overlay) */}
      {cinemaBars && (
        <>
          <div className="fixed top-0 left-0 right-0 h-10 md:h-14 bg-black pointer-events-none z-10 transition-all duration-500" />
          <div className="fixed bottom-0 left-0 right-0 h-10 md:h-14 bg-black pointer-events-none z-10 transition-all duration-500" />
        </>
      )}

      {/* 2. FLOATING NOTIFICATIONS & PARKOUR DYNAMIC ACTION BANNERS */}
      <div className="flex flex-col items-center gap-2 self-center z-30 pointer-events-none">
        {notification && (
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white px-6 py-2 rounded-full text-xl tracking-widest shadow-2xl animate-bounce border border-yellow-300">
            {notification}
          </div>
        )}

        {/* Dynamic Parkour Action States */}
        {parkourState === 'wall_stick' && (
          <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 border-2 border-yellow-300 rounded-full text-white text-base md:text-lg tracking-widest shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse pointer-events-auto">
            <span>🧗</span>
            <span className="font-extrabold">WALL STICK & ADHESION</span>
            <span className="text-xs bg-black/60 px-2 py-0.5 rounded font-mono border border-yellow-400/40 text-yellow-300">
              [SPACE] WALL JUMP • [WASD] CRAWL • [SHIFT] RUN
            </span>
          </div>
        )}

        {parkourState === 'wall_crawl' && (
          <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 border-2 border-amber-300 rounded-full text-white text-base md:text-lg tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.7)] animate-pulse pointer-events-auto">
            <span>🕷️</span>
            <span className="font-extrabold">4-WAY WALL CRAWL</span>
            <span className="text-xs bg-black/60 px-2 py-0.5 rounded font-mono border border-amber-400/40 text-amber-200">
              [WASD] CRAWL • [SPACE] WALL JUMP
            </span>
          </div>
        )}

        {parkourState === 'wall_climb' && (
          <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 border-2 border-emerald-300 rounded-full text-white text-base md:text-lg tracking-widest shadow-[0_0_25px_rgba(16,185,129,0.7)] animate-pulse pointer-events-auto">
            <span>⬆️</span>
            <span className="font-extrabold">SKYSCRAPER VERTICAL CLIMB</span>
            <span className="text-xs bg-black/60 px-2 py-0.5 rounded font-mono border border-emerald-400/40 text-emerald-200">
              [SPACE] WALL JUMP • [SHIFT] RUN
            </span>
          </div>
        )}

        {(parkourState === 'wall_jump' || parkourState === 'wall_acrobat') && (
          <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-pink-300 rounded-full text-white text-base md:text-lg tracking-widest shadow-[0_0_25px_rgba(219,39,119,0.7)] animate-pulse pointer-events-auto">
            <span>🤸</span>
            <span className="font-extrabold">ACROBATIC WALL JUMP</span>
            <span className="text-xs bg-black/60 px-2 py-0.5 rounded font-mono border border-pink-300/40 text-pink-200">
              [E] SWING • [Q] ZIP
            </span>
          </div>
        )}

        {parkourState === 'wall_run_up' && (
          <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-sky-600 to-blue-700 border-2 border-sky-300 rounded-full text-white text-base md:text-lg tracking-widest shadow-[0_0_25px_rgba(56,189,248,0.5)] animate-pulse">
            <span>🧗</span>
            <span className="font-extrabold">VERTICAL WALL RUN</span>
            <span className="text-xs bg-black/60 px-2 py-0.5 rounded font-mono border border-sky-400/40 text-sky-200">
              [SPACE] WALL KICK
            </span>
          </div>
        )}

        {parkourState === 'wall_run_horizontal' && (
          <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 border-2 border-indigo-300 rounded-full text-white text-base md:text-lg tracking-widest shadow-[0_0_25px_rgba(99,102,241,0.5)] animate-pulse">
            <span>🏃</span>
            <span className="font-extrabold">SKYSCRAPER FACADE RUN</span>
            <span className="text-xs bg-black/60 px-2 py-0.5 rounded font-mono border border-indigo-400/40 text-indigo-200">
              [SPACE] WALL JUMP
            </span>
          </div>
        )}

        {parkourState === 'vaulting' && (
          <div className="flex items-center gap-2 px-5 py-1.5 bg-gradient-to-r from-amber-500 to-red-600 border-2 border-yellow-300 rounded-full text-white text-base md:text-lg tracking-widest shadow-[0_0_25px_rgba(234,179,8,0.6)]">
            <span>⚡</span>
            <span className="font-extrabold">OBSTACLE VAULT</span>
          </div>
        )}

        {parkourState === 'ledge_hang' && (
          <div className="pointer-events-auto flex flex-col items-center gap-2 animate-bounce">
            <div className="flex items-center gap-3 px-6 py-2.5 bg-neutral-950/95 border-2 border-yellow-400 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.7)] backdrop-blur-md">
              <span className="text-xl">🧱</span>
              <div className="flex flex-col">
                <span className="text-yellow-400 text-sm md:text-base font-extrabold tracking-wider">
                  LEDGE GRAB HANGING
                </span>
                <span className="text-neutral-300 text-xs font-sans">
                  Press <kbd className="px-1.5 py-0.5 bg-amber-500 text-black font-bold rounded">SPACE</kbd> or <kbd className="px-1.5 py-0.5 bg-amber-500 text-black font-bold rounded">W</kbd> to Hoist onto Roof
                </span>
              </div>
              <button
                onClick={onClimbAction}
                className="ml-2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 active:scale-95 text-neutral-950 font-black text-sm rounded-xl border border-yellow-200 shadow-md cursor-pointer tracking-wider"
              >
                CLIMB UP
              </button>
            </div>
          </div>
        )}

        {parkourState === 'ledge_climb' && (
          <div className="flex items-center gap-2 px-5 py-1.5 bg-gradient-to-r from-green-600 to-emerald-700 border-2 border-green-300 rounded-full text-white text-base md:text-lg tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.5)]">
            <span>⬆️</span>
            <span className="font-extrabold">HOISTING ONTO ROOFTOP</span>
          </div>
        )}
      </div>

      {/* 3. MIDDLE SECTION: Mission Tracker (Left), Interactive Citizen Prompt (Center), Minimap Radar (Right) */}
      <div className="flex justify-between items-end w-full my-auto gap-4">
        {/* Left: Active Mission HUD */}
        <div className="pointer-events-auto max-w-xs md:max-w-sm bg-neutral-900/85 border-l-4 border-red-500 p-3.5 rounded-r-2xl backdrop-blur-md shadow-2xl">
          {activeMission ? (
            <div>
              <div className="flex items-center justify-between text-xs text-red-400 tracking-wider mb-0.5">
                <span className="flex items-center gap-1 font-sans font-bold">
                  <Crosshair size={13} /> ACTIVE OBJECTIVE
                </span>
                <span className="text-yellow-400 font-bold">+{activeMission.reward} 🍕</span>
              </div>
              <h3 className="text-xl text-white font-bold leading-tight tracking-wide">
                {activeMission.title}
              </h3>
              <p className="text-xs text-neutral-300 font-sans mt-0.5">
                {activeMission.description}
              </p>
              <div className="mt-2.5 flex items-center justify-between bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-neutral-700 text-sm">
                <span className="text-neutral-400 text-xs">Target Distance:</span>
                <span
                  className={`font-bold ${
                    missionDist < 25 ? 'text-green-400 animate-pulse' : 'text-sky-400'
                  }`}
                >
                  {missionDist}m
                </span>
              </div>
            </div>
          ) : (
            <div className="text-neutral-400 text-base">
              Explore Manhattan & collect pizza slices!
            </div>
          )}
        </div>

        {/* Center: Live Pedestrian AI Interaction Banner */}
        {nearbyCitizen && (
          <div className="pointer-events-auto self-end flex flex-col items-center gap-1.5 animate-bounce mb-2 z-30">
            <button
              onClick={onInteractWithCitizen}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-neutral-950 font-extrabold rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.6)] border-2 border-yellow-200 text-lg tracking-wider transition active:scale-95 cursor-pointer"
            >
              <span className="text-xl">🤝</span>
              <span>{nearbyCitizen.actionText}</span>
              <kbd className="px-2 py-0.5 bg-black/85 text-yellow-300 rounded-lg text-xs font-mono font-black border border-yellow-400/50">
                [G]
              </kbd>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-yellow-200 bg-neutral-950/90 px-3.5 py-1 rounded-full border border-yellow-500/40 font-sans backdrop-blur-md shadow-lg">
              <span className="font-bold text-amber-400">{nearbyCitizen.name}:</span>
              <span className="italic">"{nearbyCitizen.quote}"</span>
            </div>
          </div>
        )}

        {/* Right: Integrated Spider-Man Minimap Overlay */}
        <div className="pointer-events-auto flex flex-col items-end">
          <CityMinimap
            playerPos={playerPos}
            playerRotY={playerRotY}
            buildings={buildings}
            activeMission={activeMission}
            pizzas={pizzas}
            pedestrians={pedestrians}
            currentWeather={weather}
            onSelectWeatherZone={(zone) => onWeatherChange(zone.weather)}
          />
        </div>
      </div>

      {/* 3.5. Live Police Radio Scanner Dispatch Floating Bar */}
      <div className="flex justify-center mb-2 z-20">
        <CrimeRadioDispatch
          playerPos={playerPos}
          onAcceptCrime={(crime) => {
            setActiveRadioIncident(crime);
          }}
          activeIncident={activeRadioIncident}
          onDismissIncident={() => setActiveRadioIncident(null)}
        />
      </div>

      {/* 4. BOTTOM SECTION: Speedometer & Gadgets & Suit Ultimate & Controls Guide & Mobile Action Buttons */}
      <div className="flex flex-col gap-2.5 w-full pointer-events-auto items-center">
        {/* Gadget Bar and Suit Ultimate Power Meter */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {/* Spider-Man Tech Gadget Bar */}
          <SpiderGadgetBar
            activeGadget={activeGadget}
            onSelectGadget={(g) => setActiveGadget(g)}
            charges={gadgetCharges}
            onFireGadget={handleFireGadget}
          />

          {/* Suit Ultimate Power Meter */}
          {onActivateSuitPower && (
            <SuitUltimatePowerHUD
              suitId={suitId}
              suitName={suitName}
              powerCharge={suitPowerCharge}
              isActive={suitPowerActive}
              onActivatePower={onActivateSuitPower}
            />
          )}
        </div>

        {/* Desktop Controls Bar */}
        <div className="hidden md:flex items-center justify-center gap-2 bg-neutral-900/85 border border-neutral-800 py-1 px-4 rounded-full self-center backdrop-blur-md text-xs text-neutral-300 tracking-wider flex-wrap shadow-lg">
          <span className="text-amber-400 font-bold">
            GTA V Movement:
          </span>
          <span>
            <kbd className="px-1 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-white font-mono font-bold">
              W / ▲
            </kbd>{' '}
            Forward
          </span>
          <span className="text-neutral-600">•</span>
          <span>
            <kbd className="px-1 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-white font-mono font-bold">
              S / ▼
            </kbd>{' '}
            Walk Backwards
          </span>
          <span className="text-neutral-600">•</span>
          <span>
            <kbd className="px-1 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-white font-mono font-bold">
              A / ◀
            </kbd>{' '}
            Walk Left
          </span>
          <span className="text-neutral-600">•</span>
          <span>
            <kbd className="px-1 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-white font-mono font-bold">
              D / ▶
            </kbd>{' '}
            Walk Right
          </span>
          <span className="text-neutral-600">•</span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-emerald-800 border border-emerald-600 rounded text-emerald-200 font-mono font-bold">
              SHIFT
            </kbd>{' '}
            Sprint / Wall-Run
          </span>
          <span className="text-neutral-600">•</span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-rose-900 border border-rose-600 rounded text-rose-200 font-mono font-bold">
              X
            </kbd>{' '}
            Stick / Crawl
          </span>
          <span className="text-neutral-600">•</span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-fuchsia-900 border border-fuchsia-600 rounded text-fuchsia-200 font-mono font-bold">
              Z
            </kbd>{' '}
            Acrobatics
          </span>
          <span className="text-neutral-600">•</span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-amber-800 border border-amber-600 rounded text-yellow-300 font-mono font-bold">
              SPACE
            </kbd>{' '}
            Vault / Jump
          </span>
          <span className="text-neutral-600">•</span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-red-800 border border-red-600 rounded text-white font-mono font-bold">
              E
            </kbd>{' '}
            Swing
          </span>
          <span className="text-neutral-600">•</span>
          <span>
            <kbd className="px-1 py-0.5 bg-sky-800 border border-sky-600 rounded text-white font-mono">
              Q
            </kbd>{' '}
            Zip
          </span>
          <span className="text-neutral-600">•</span>
          <span>
            <kbd className="px-1 py-0.5 bg-sky-900 border border-sky-500 rounded text-sky-300 font-mono font-bold">
              V
            </kbd>{' '}
            Cam
          </span>
        </div>

        {/* Gamepad Detected Badge */}
        {gamepadConnected && (
          <div className="flex items-center justify-center gap-2 self-center bg-indigo-950/80 border border-indigo-500/50 px-3.5 py-1 rounded-full text-indigo-300 text-xs font-sans shadow-lg">
            <Gamepad2 size={14} className="text-indigo-400 animate-pulse" />
            <span className="font-bold">Controller Connected:</span>
            <span>[Left Stick] Move (Up=Fwd, Down=Back, L/R=Strafe)</span>
            <span className="text-indigo-500">•</span>
            <span>[A] Jump / Climb</span>
            <span className="text-indigo-500">•</span>
            <span>[RT] Swing</span>
          </div>
        )}

        {/* On-Screen Action Touch Buttons & Mobile Movement (Desktop non-gamepad fallback) */}
        <div className="flex items-end justify-between w-full flex-wrap gap-2">
          {/* Speedometer Widget */}
          <div className="bg-neutral-900/85 border border-neutral-700 px-3 py-1.5 rounded-2xl backdrop-blur-md shadow-xl flex items-center gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-300">
                {speed}
              </span>
              <span className="text-[10px] text-red-500 font-sans font-bold">MPH</span>
            </div>
            <div className="w-14 bg-neutral-800 h-1.5 rounded-full overflow-hidden border border-neutral-700">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-yellow-400 to-red-500 transition-all duration-100"
                style={{ width: `${Math.min(100, (speed / 90) * 100)}%` }}
              />
            </div>
          </div>

          {/* Desktop On-Screen Buttons (Hidden on mobile where PlayStationTouchOverlay is active) */}
          {!isMobile && (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap ml-auto">
              {/* Ledge Hoist Action Button (Visible during ledge grab) */}
              {parkourState === 'ledge_hang' && onClimbAction && (
                <button
                  onClick={onClimbAction}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 border border-yellow-200 rounded-xl shadow-xl text-neutral-950 text-base font-black flex items-center gap-1 hover:brightness-110 active:scale-95 animate-pulse"
                >
                  <span>⬆️ CLIMB UP [{glyphs.confirm}]</span>
                </button>
              )}

              {/* Citizen Greet Button */}
              {nearbyCitizen && (
                <button
                  onClick={onInteractWithCitizen}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 border border-yellow-200 rounded-xl shadow-xl text-neutral-950 text-base font-extrabold flex items-center gap-1 hover:brightness-110 active:scale-95"
                >
                  <span>🤝 GREET [{glyphs.special}]</span>
                </button>
              )}

              {/* Wall Stick / Adhere button */}
              <button
                onClick={() => {
                  onControlChange('stick', true);
                  setTimeout(() => onControlChange('stick', false), 400);
                }}
                className="px-3 py-2 bg-red-800 active:bg-red-950 border border-red-500 rounded-xl shadow-xl text-xs sm:text-sm flex items-center gap-1 hover:brightness-110 transition active:scale-95 text-yellow-300 font-bold"
                title="Stick to nearest skyscraper wall"
              >
                <span className="w-5 h-5 rounded bg-black/40 flex items-center justify-center font-mono font-bold text-xs">{glyphs.stick}</span>
                <span>STICK</span>
              </button>

              {/* Wall Run / Sprint button */}
              <button
                onMouseDown={() => onControlChange('sprint', true)}
                onMouseUp={() => onControlChange('sprint', false)}
                className="px-3 py-2 bg-emerald-700 active:bg-emerald-900 border border-emerald-400 rounded-xl shadow-xl text-xs sm:text-sm flex items-center gap-1 hover:brightness-110 transition active:scale-95 text-emerald-100 font-bold"
                title="Hold to Wall-Run along skyscraper faces"
              >
                <span className="w-5 h-5 rounded bg-black/40 flex items-center justify-center font-mono font-bold text-xs">{glyphs.sprint}</span>
                <span>WALL RUN</span>
              </button>

              {/* Swing button */}
              <button
                onMouseDown={() => onControlChange('swing', true)}
                onMouseUp={() => onControlChange('swing', false)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 active:from-red-800 active:to-red-900 border border-red-400 rounded-xl shadow-xl text-sm sm:text-base flex items-center gap-1.5 hover:brightness-110 transition active:scale-95 text-white font-bold"
              >
                <span className="w-5 h-5 rounded bg-black/40 flex items-center justify-center font-mono font-bold text-xs">{glyphs.swing}</span>
                <Sparkles size={15} />
                <span>SWING</span>
              </button>

              {/* Dash / Air Burst */}
              <button
                onClick={() => {
                  onControlChange('dash', true);
                  setTimeout(() => onControlChange('dash', false), 250);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 active:from-cyan-800 active:to-blue-800 border border-cyan-300 rounded-xl shadow-xl text-xs sm:text-sm flex items-center gap-1 hover:brightness-110 transition active:scale-95 font-bold text-white"
                title="Supersonic Web Dash (Key: R)"
              >
                <Zap size={14} className="text-yellow-300 animate-pulse" />
                <span>DASH</span>
              </button>

              {/* Web Zip Propel Button */}
              <button
                onClick={() => {
                  onControlChange('zip', true);
                  setTimeout(() => onControlChange('zip', false), 250);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 active:from-sky-800 active:to-indigo-800 border-2 border-sky-300 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.5)] text-xs sm:text-sm flex items-center gap-1.5 hover:brightness-110 transition active:scale-95 font-black text-white group animate-pulse"
                title="Web-Zip: Rapidly propels forward towards target point or building face [Key: Q]"
              >
                <span className="w-5 h-5 rounded bg-black/50 flex items-center justify-center font-mono font-black text-xs text-sky-200 border border-sky-400/40">
                  {glyphs.special || 'Q'}
                </span>
                <Crosshair size={15} className="text-yellow-300 group-hover:rotate-45 transition duration-300" />
                <span>WEB-ZIP</span>
              </button>

              {/* Vault / Jump */}
              <button
                onClick={() => {
                  onControlChange('jump', true);
                  setTimeout(() => onControlChange('jump', false), 200);
                }}
                className="px-3.5 py-2 bg-amber-600 active:bg-amber-700 border border-yellow-300 rounded-xl shadow-xl text-xs sm:text-sm hover:brightness-110 transition active:scale-95 font-bold"
              >
                <span className="w-5 h-5 rounded bg-black/40 flex items-center justify-center font-mono font-bold text-xs">{glyphs.confirm}</span>
                <span>JUMP</span>
              </button>

              {/* Acrobatics / Somersault */}
              <button
                onClick={() => {
                  onControlChange('acrobat', true);
                  setTimeout(() => onControlChange('acrobat', false), 400);
                }}
                className="px-3 py-2 bg-gradient-to-r from-fuchsia-700 to-purple-700 active:from-fuchsia-900 active:to-purple-900 border border-fuchsia-400 rounded-xl shadow-xl text-xs sm:text-sm hover:brightness-110 transition active:scale-95 font-bold text-white flex items-center gap-1"
                title="Perform Acrobatic Wall Kick and Somersault"
              >
                <span className="w-5 h-5 rounded bg-black/40 flex items-center justify-center font-mono font-bold text-xs">{glyphs.acrobat}</span>
                <span>ACROBAT</span>
              </button>

              {/* Attack */}
              <button
                onClick={() => {
                  onControlChange('attack', true);
                  setTimeout(() => onControlChange('attack', false), 200);
                }}
                className="px-3 py-2 bg-neutral-800 active:bg-neutral-700 border border-neutral-600 rounded-xl shadow-xl text-xs sm:text-sm hover:brightness-110 transition active:scale-95 font-bold"
              >
                <span className="w-5 h-5 rounded bg-black/40 flex items-center justify-center font-mono font-bold text-xs">{glyphs.attack}</span>
                <span>HIT</span>
              </button>

              {/* Ground Slam */}
              <button
                onClick={() => {
                  onControlChange('slam', true);
                  setTimeout(() => onControlChange('slam', false), 200);
                }}
                className="px-3 py-2 bg-purple-700 active:bg-purple-900 border border-purple-400 rounded-xl shadow-xl text-xs sm:text-sm hover:brightness-110 transition active:scale-95 font-bold"
              >
                <span className="w-5 h-5 rounded bg-black/40 flex items-center justify-center font-mono font-bold text-xs">{glyphs.cancel}</span>
                <span>SLAM</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Spider-Vision AR Scanner Visual Screen Overlay */}
      {spiderVisionActive && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden flex flex-col justify-between p-4">
          {/* Cyan Corner Brackets */}
          <div className="flex justify-between w-full">
            <div className="w-12 h-12 border-t-2 border-l-2 border-cyan-400 opacity-80" />
            <div className="text-center font-mono text-cyan-400 text-xs tracking-widest bg-cyan-950/80 px-4 py-1 rounded-full border border-cyan-500/60 shadow-[0_0_15px_#06b6d4]">
              SPIDER-SENSE AR SCANNER ACTIVE // TARGETING HUD
            </div>
            <div className="w-12 h-12 border-t-2 border-r-2 border-cyan-400 opacity-80" />
          </div>

          {/* Center Targeting Reticle */}
          <div className="self-center flex flex-col items-center opacity-60">
            <div className="w-16 h-16 rounded-full border border-cyan-400/50 flex items-center justify-center animate-spin">
              <div className="w-8 h-8 rounded-full border-t-2 border-b-2 border-cyan-300" />
            </div>
          </div>

          <div className="flex justify-between w-full">
            <div className="w-12 h-12 border-b-2 border-l-2 border-cyan-400 opacity-80" />
            <div className="text-center font-mono text-cyan-400 text-[10px] tracking-widest">
              FREQ: 844.2 MHZ // BIOMETRICS: NORMAL
            </div>
            <div className="w-12 h-12 border-b-2 border-r-2 border-cyan-400 opacity-80" />
          </div>
        </div>
      )}

      {/* 6. Realtime Multiplayer Co-Op Session Modal */}
      <MultiplayerHubModal
        isOpen={multiplayerHubOpen}
        onClose={() => setMultiplayerHubOpen(false)}
        multiplayerEnabled={multiplayerEnabled}
        onToggleMultiplayer={() => setMultiplayerEnabled(!multiplayerEnabled)}
        onSendCoopPing={(msg) => {
          // Handled inside modal with notification
        }}
      />
    </div>
  );
}
