import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import CityEnvironment from './CityEnvironment';
import SpiderCharacter from './SpiderCharacter';
import CameraController from './CameraController';
import ExploreHUD from './ExploreHUD';
import PlayStationTouchOverlay from './PlayStationTouchOverlay';
import PhotoModeUI from './PhotoModeUI';
import DailyBugleBroadcast from './DailyBugleBroadcast';
import PhotoGalleryModal from './PhotoGalleryModal';
import HolidayPizzaBonusesModal from '../HolidayPizzaBonusesModal';
import Leaderboard from '../Leaderboard';
import { MultiplayerCityPlayers } from './MultiplayerCityPlayers';
import { SettingsModal } from '../SettingsModal';
import Achievements, {
  AchievementItem,
  AchievementToast,
  trackAchievementProgress,
} from '../Achievements';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  BuildingData,
  CrimeMission,
  PizzaPickup,
  PlayerControls,
  WeatherType,
  PhotoSettings,
  SavedPhoto,
  PedestrianData,
  NearbyCitizenPrompt,
  ParkourState,
  CameraMode,
  LiveWeatherReport,
} from './CityTypes';
import { Character, GameSettings, SpideySaveData } from '../../types';
import { useAudio } from '../../hooks/useAudio';
import {
  detectDevice,
  detectConnectedGamepad,
  getControllerGlyphs,
  DeviceInfo,
  ControllerInfo,
} from '../../utils/deviceDetector';
import {
  loadGameSettings,
  saveGameSettings,
} from '../../utils/saveDataManager';

interface CityExplorer3DProps {
  selectedCharacter: Character | null;
  pizza: number;
  onUpdatePizza: (newTotal: number) => void;
  onExit: () => void;
  onOpenCharacterSelection: () => void;
}

export default function CityExplorer3D({
  selectedCharacter,
  pizza,
  onUpdatePizza,
  onExit,
  onOpenCharacterSelection,
}: CityExplorer3DProps) {
  const { playSound } = useAudio();

  // Settings & System Management
  const [gameSettings, setGameSettings] = useState<GameSettings>(() => loadGameSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => detectDevice());
  const [gamepadInfo, setGamepadInfo] = useState<ControllerInfo>(() => detectConnectedGamepad());

  const handleUpdateSettings = useCallback((newSettings: GameSettings) => {
    setGameSettings(newSettings);
    saveGameSettings(newSettings);
    if (newSettings.firstPersonCamera) {
      setCameraMode('first_person');
    } else if (newSettings.vrModeEnabled) {
      setCameraMode('vr_quest');
    }
  }, []);

  // Compute active controller button glyphs
  const activeGlyphs = useMemo(() => {
    const brand = gamepadInfo.connected ? gamepadInfo.brand : gameSettings.touchLayout;
    return getControllerGlyphs(brand);
  }, [gamepadInfo, gameSettings.touchLayout]);

  // Dynamic Weather System State
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [autoCycleWeather, setAutoCycleWeather] = useState<boolean>(true);

  // Photo Mode State
  const [isPhotoModeOpen, setIsPhotoModeOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [photoSettings, setPhotoSettings] = useState<PhotoSettings>({
    active: false,
    fov: 65,
    distance: 12,
    orbitAngle: 0,
    height: 0,
    tilt: 0,
    pose: 'action',
    filter: 'none',
    frame: 'none',
    sticker: 'none',
    showGrid: false,
    vignette: true,
  });

  // Real-time Weather Report & Daily Bugle Broadcast State
  const [liveWeatherReport, setLiveWeatherReport] = useState<LiveWeatherReport | null>(null);
  const [showLiveBroadcast, setShowLiveBroadcast] = useState<boolean>(true);

  // Achievements State & Milestone Pop-up Toast
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isHolidayBonusesOpen, setIsHolidayBonusesOpen] = useState<boolean>(false);
  const [recentAchievement, setRecentAchievement] = useState<AchievementItem | null>(null);

  // Live Real-Time Canvas CSS Filter calculation for Photo Mode
  const canvasFilter = useMemo(() => {
    if (!isPhotoModeOpen) return 'none';
    switch (photoSettings.filter) {
      case 'sepia':
        return 'sepia(90%) contrast(115%) brightness(1.02)';
      case 'high_contrast':
        return 'contrast(185%) saturate(145%) brightness(1.05)';
      case 'black_and_white':
        return 'grayscale(100%) contrast(125%) brightness(1.05)';
      case 'noir':
        return 'grayscale(100%) contrast(155%) brightness(0.9)';
      case 'comic':
        return 'contrast(160%) saturate(160%)';
      case 'cyberpunk':
        return 'hue-rotate(180deg) saturate(190%)';
      case 'golden':
        return 'sepia(35%) saturate(170%) brightness(1.05)';
      default:
        return 'none';
    }
  }, [isPhotoModeOpen, photoSettings.filter]);

  // Pointer drag heading rotation
  const [turnDelta, setTurnDelta] = useState<number>(0);
  const isDraggingPointer = useRef<boolean>(false);
  const lastPointerX = useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPhotoModeOpen) return;
    isDraggingPointer.current = true;
    lastPointerX.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingPointer.current || isPhotoModeOpen) return;
    const deltaX = e.clientX - lastPointerX.current;
    lastPointerX.current = e.clientX;
    setTurnDelta(-deltaX * 0.006);
    requestAnimationFrame(() => setTurnDelta(0));
  };

  const handlePointerUp = () => {
    isDraggingPointer.current = false;
    setTurnDelta(0);
  };

  // Saved Photos with LocalStorage Persistence
  const [savedPhotos, setSavedPhotos] = useState<SavedPhoto[]>(() => {
    try {
      const cached = localStorage.getItem('spiderman_photos');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const handleSavePhoto = useCallback((photo: SavedPhoto) => {
    setSavedPhotos((prev) => {
      const updated = [photo, ...prev];
      try {
        localStorage.setItem('spiderman_photos', JSON.stringify(updated.slice(0, 25)));
      } catch {
        // storage quota fallback
      }
      return updated;
    });
  }, []);

  const handleDeletePhoto = useCallback((id: string) => {
    setSavedPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('spiderman_photos', JSON.stringify(updated));
      } catch {
        // fallback
      }
      return updated;
    });
  }, []);

  // Weather Cycling Interval
  useEffect(() => {
    if (!autoCycleWeather) return;
    const weathers: WeatherType[] = ['clear', 'rain', 'snow'];
    const interval = setInterval(() => {
      setWeather((prev) => {
        const nextIdx = (weathers.indexOf(prev) + 1) % weathers.length;
        const next = weathers[nextIdx];
        if (next === 'rain') playSound('thunder');
        return next;
      });
    }, 45000);
    return () => clearInterval(interval);
  }, [autoCycleWeather, playSound]);

  const handleWeatherChange = useCallback((newWeather: WeatherType) => {
    setWeather(newWeather);
    if (newWeather === 'rain') playSound('thunder');
  }, [playSound]);

  // Cinematic Camera & Parkour System States
  const [cameraMode, setCameraMode] = useState<CameraMode>('cinematic');
  const [cinemaBars, setCinemaBars] = useState<boolean>(false);
  const [parkourState, setParkourState] = useState<ParkourState>('none');
  const [wallNormal, setWallNormal] = useState<[number, number, number]>([0, 0, 1]);
  const [gamepadConnected, setGamepadConnected] = useState<boolean>(false);

  // Character movement controls state
  const [controls, setControls] = useState<PlayerControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    swing: false,
    zip: false,
    attack: false,
    slam: false,
    sprint: false,
    dash: false,
    parkour: false,
    climb: false,
    crawl: false,
    stick: false,
    acrobat: false,
  });

  // Dynamic telemetry & world perception
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 15, 0]);
  const [playerRotY, setPlayerRotY] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [isSwinging, setIsSwinging] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Spider-Vision AR Scanner & Suit Ultimate Power
  const [spiderVisionActive, setSpiderVisionActive] = useState<boolean>(false);
  const [suitPowerCharge, setSuitPowerCharge] = useState<number>(100);
  const [suitPowerActive, setSuitPowerActive] = useState<boolean>(false);

  // Pedestrian AI & Karma System
  const [pedestrians, setPedestrians] = useState<PedestrianData[]>([]);
  const [nearbyCitizen, setNearbyCitizen] = useState<NearbyCitizenPrompt | null>(null);
  const [activeInteractionTrigger, setActiveInteractionTrigger] = useState<number>(0);
  const [heroKarma, setHeroKarma] = useState<number>(120);

  // Generate Expanded Procedural Manhattan City Layout
  const buildings = useMemo<BuildingData[]>(() => {
    const list: BuildingData[] = [];
    const colors = [
      '#1e293b', // Slate Dark
      '#0f172a', // Midnight Blue
      '#334155', // Steel Gray
      '#1e1b4b', // Oscorp Indigo
      '#18181b', // Onyx Black
      '#27272a', // Zinc Modern
      '#1c1917', // Stone Brownstone
      '#172554', // Midtown Blue Glass
    ];
    const windowColors = ['#fde047', '#38bdf8', '#fb923c', '#e2e8f0', '#a7f3d0'];

    // Grid layout with avenues spanning 480m x 480m
    for (let x = -240; x <= 240; x += 40) {
      for (let z = -240; z <= 240; z += 40) {
        // Skip central plaza for open starter swinging space
        if (Math.abs(x) < 22 && Math.abs(z) < 22) continue;

        const hash = Math.sin(x * 99 + z * 37);
        const hash2 = Math.cos(x * 47 + z * 83);
        const distFromCenter = Math.sqrt(x * x + z * z);

        const width = 22 + Math.abs(hash * 10);
        const depth = 22 + Math.abs(hash2 * 10);

        // Midtown core has towering supertalls (up to 135m), outer districts have varied brownstones & modern mid-rises
        let baseHeight = 35;
        if (distFromCenter < 120) {
          baseHeight = 65 + Math.abs(Math.sin(x * 13 + z) * 65);
        } else {
          baseHeight = 28 + Math.abs(Math.sin(x * 7 + z * 11) * 55);
        }

        const height = Math.round(baseHeight);
        const color = colors[Math.floor(Math.abs(hash * colors.length)) % colors.length];
        const windowColor = windowColors[Math.floor(Math.abs(hash2 * windowColors.length)) % windowColors.length];

        list.push({
          id: `bld_${x}_${z}`,
          x: x + hash * 3.5,
          z: z + hash2 * 3.5,
          width,
          depth,
          height,
          color,
          windowColor,
          hasWaterTower: Math.abs(hash) > 0.4,
          hasAntenna: height > 60,
          roofAnchor: [x, height, z],
        });
      }
    }
    return list;
  }, []);

  // Collectible Pizzas scattered on rooftops and streets across expanded Manhattan
  const [pizzas, setPizzas] = useState<PizzaPickup[]>(() => {
    return [
      { id: 'p1', position: [0, 1, -20], collected: false, points: 50 },
      { id: 'p2', position: [40, 55, 40], collected: false, points: 100 },
      { id: 'p3', position: [-40, 65, -40], collected: false, points: 100 },
      { id: 'p4', position: [80, 80, -40], collected: false, points: 150 },
      { id: 'p5', position: [-80, 45, 80], collected: false, points: 75 },
      { id: 'p6', position: [0, 85, 80], collected: false, points: 150 },
      { id: 'p7', position: [-80, 1, -80], collected: false, points: 50 },
      { id: 'p8', position: [80, 1, 80], collected: false, points: 50 },
      { id: 'p9', position: [160, 105, 120], collected: false, points: 200 },
      { id: 'p10', position: [-160, 95, -160], collected: false, points: 200 },
      { id: 'p11', position: [-120, 1, 160], collected: false, points: 100 },
      { id: 'p12', position: [160, 1, -160], collected: false, points: 100 },
    ];
  });

  // Missions list with expanded citywide objectives
  const [missions, setMissions] = useState<CrimeMission[]>([
    {
      id: 'm1',
      title: 'Rooftop Thug Ambush',
      description: 'Swing to the marked skyscraper roof in Midtown to intercept the crime syndicate!',
      location: [40, 56, 40],
      type: 'thug_ambush',
      reward: 250,
      completed: false,
    },
    {
      id: 'm2',
      title: 'High-Altitude Oscorp Spire Probe',
      description: 'Reach the apex antenna at the north skyscraper summit!',
      location: [0, 92, 80],
      type: 'time_trial',
      reward: 400,
      completed: false,
    },
    {
      id: 'm3',
      title: 'East River Express Pizza Run',
      description: 'Speed-swing across town to drop emergency deep-dish slices to citizens!',
      location: [-80, 48, 80],
      type: 'pizza_delivery',
      reward: 350,
      completed: false,
    },
    {
      id: 'm4',
      title: 'Financial District Heist Interception',
      description: 'Perch atop the Financial District supertall and secure the rooftop vault!',
      location: [160, 110, 120],
      type: 'hostage_rescue',
      reward: 500,
      completed: false,
    },
    {
      id: 'm5',
      title: 'Hudson Yards Acrobatic Speed Run',
      description: 'Chain web-swings, wall-runs, and supersonic dashes through the western canyon!',
      location: [-160, 98, -160],
      type: 'time_trial',
      reward: 450,
      completed: false,
    },
  ]);

  const [activeMissionIndex, setActiveMissionIndex] = useState<number>(0);
  const activeMission = missions[activeMissionIndex] || null;

  // Toggle Camera Mode (Cinematic, Action, Drone, First-Person, Meta Quest VR)
  const handleToggleCameraMode = useCallback(() => {
    setCameraMode((prev) => {
      const modes: CameraMode[] = ['cinematic', 'action', 'drone', 'first_person', 'vr_quest'];
      const next = modes[(modes.indexOf(prev) + 1) % modes.length];
      playSound('whoosh');
      setNotification(`CAMERA: ${next.replace('_', ' ').toUpperCase()}`);
      setTimeout(() => setNotification(null), 1800);
      return next;
    });
  }, [playSound]);

  // Handle Loading Imported .spidey Save Data
  const handleLoadSpideySaveData = useCallback((imported: SpideySaveData) => {
    if (imported.pizza !== undefined) {
      onUpdatePizza(imported.pizza);
    }
    if (imported.settings) {
      setGameSettings(imported.settings);
      saveGameSettings(imported.settings);
    }
    if (imported.karma !== undefined) {
      setHeroKarma(imported.karma);
    }
    if (imported.photos && Array.isArray(imported.photos)) {
      setSavedPhotos(imported.photos);
    }
    setNotification('💾 .SPIDEY SAVE DATA RESTORED!');
    setTimeout(() => setNotification(null), 3000);
  }, [onUpdatePizza]);

  // Toggle Anamorphic Cinema Scope Letterbox
  const handleToggleCinemaBars = useCallback(() => {
    setCinemaBars((prev) => {
      const next = !prev;
      setNotification(next ? 'CINEMA SCOPE 2.39:1 ON' : 'CINEMA SCOPE OFF');
      setTimeout(() => setNotification(null), 1800);
      return next;
    });
  }, []);

  // -------------------------------------------------------------
  // Achievements Real-time Tracking & Pop-up Notification Engine
  // -------------------------------------------------------------
  const triggerAchievement = useCallback(
    (id: string, amount: number = 1, mode: 'set' | 'increment' = 'increment') => {
      const result = trackAchievementProgress(id, amount, mode);
      if (result.unlockedItem) {
        setRecentAchievement(result.unlockedItem);
        playSound('rankup');
        setNotification(`🏆 UNLOCKED: ${result.unlockedItem.title}!`);
        setTimeout(() => setNotification(null), 3500);
      }
    },
    [playSound]
  );

  // Realtime Pizza Milestone Watcher (e.g. 5,000 and 1,000 pizza achievements)
  useEffect(() => {
    if (pizza >= 5000) {
      triggerAchievement('pizza_5000', pizza, 'set');
    }
    if (pizza >= 1000) {
      triggerAchievement('pizza_1000', pizza, 'set');
    }
  }, [pizza, triggerAchievement]);

  // Parkour State change handler from SpiderCharacter
  const handleParkourStateChange = useCallback(
    (newState: ParkourState) => {
      setParkourState(newState);
      if (newState === 'wall_stick') {
        triggerAchievement('wall_stick', 1, 'set');
      } else if (newState === 'wall_crawl') {
        triggerAchievement('wall_crawl', 1, 'increment');
      } else if (newState === 'wall_climb') {
        triggerAchievement('wall_climb', 5, 'increment');
      } else if (newState === 'wall_run_up' || newState === 'wall_run_horizontal') {
        triggerAchievement('wall_run', 1, 'increment');
      } else if (newState === 'wall_jump') {
        triggerAchievement('wall_jump', 1, 'increment');
      } else if (newState === 'wall_acrobat' || newState === 'vaulting') {
        triggerAchievement('wall_acrobat', 1, 'increment');
      }
    },
    [triggerAchievement]
  );

  // Ledge Climb Trigger Handler
  const handleClimbAction = useCallback(() => {
    setControls((c) => ({ ...c, jump: true, climb: true, parkour: true }));
    setTimeout(() => {
      setControls((c) => ({ ...c, jump: false, climb: false, parkour: false }));
    }, 250);
  }, []);

  // Spider-Vision AR Scanner Toggle Handler
  const handleToggleSpiderVision = useCallback(() => {
    setSpiderVisionActive((prev) => {
      const next = !prev;
      if (next) {
        setNotification('👁️ SPIDER-VISION ACTIVE: POIs, Landmarks, Subways & Threats Highlighted');
        if (playSound) playSound('whoosh');
      } else {
        setNotification('👁️ SPIDER-VISION STANDBY');
      }
      return next;
    });
  }, [playSound]);

  // Suit Ultimate Power Activation Handler
  const handleActivateSuitPower = useCallback(() => {
    if (suitPowerCharge < 100 || suitPowerActive) return;

    setSuitPowerActive(true);
    setSuitPowerCharge(0);
    setNotification('⚡ SUIT ULTIMATE POWER ACTIVATED!');
    if (playSound) playSound('rankup');

    // Gradually refill power gauge over 25 seconds of movement/combat
    setTimeout(() => {
      setSuitPowerActive(false);
    }, 8000);

    const interval = setInterval(() => {
      setSuitPowerCharge((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 1200);
  }, [suitPowerCharge, suitPowerActive, playSound]);

  // Fast Travel Handler
  const handleFastTravel = useCallback(
    (dest: [number, number, number], name: string) => {
      setPlayerPos(dest);
      setNotification(`🚇 ARRIVED AT: ${name}`);
      if (playSound) playSound('swing');
    },
    [playSound]
  );

  // Keyboard Event Listeners with Dynamic Custom Keybindings & Parkour
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const kb = gameSettings.keybindings;

      // Photo Mode Toggle shortcut
      if (code === kb.photo || code === 'KeyP') {
        setIsPhotoModeOpen((prev) => {
          const next = !prev;
          setPhotoSettings((s) => ({ ...s, active: next }));
          if (next) playSound('shutter');
          return next;
        });
        return;
      }

      // Escape exits Photo Mode or Gallery
      if (code === 'Escape') {
        if (isGalleryOpen) {
          setIsGalleryOpen(false);
          return;
        }
        if (isPhotoModeOpen) {
          setIsPhotoModeOpen(false);
          setPhotoSettings((s) => ({ ...s, active: false }));
          return;
        }
      }

      // If in photo mode, handle filter shortcuts or ignore movement controls
      if (isPhotoModeOpen) {
        if (code === 'Digit1') setPhotoSettings((s) => ({ ...s, filter: 'none' }));
        if (code === 'Digit2') setPhotoSettings((s) => ({ ...s, filter: 'sepia' }));
        if (code === 'Digit3') setPhotoSettings((s) => ({ ...s, filter: 'high_contrast' }));
        if (code === 'Digit4') setPhotoSettings((s) => ({ ...s, filter: 'black_and_white' }));
        return;
      }

      // Camera Mode Toggle
      if (code === kb.camera || code === 'KeyV') {
        handleToggleCameraMode();
        return;
      }

      // Cinema Letterbox Toggle: KeyB
      if (code === 'KeyB') {
        handleToggleCinemaBars();
        return;
      }

      // Spider-Vision AR Scanner Toggle: KeyT
      if (code === 'KeyT') {
        handleToggleSpiderVision();
        return;
      }

      // Suit Ultimate Power Activation: KeyF (if charged)
      if (code === 'KeyF' && suitPowerCharge >= 100 && !suitPowerActive) {
        handleActivateSuitPower();
        return;
      }

      // Greet nearby citizen
      if (code === 'KeyG') {
        setActiveInteractionTrigger((prev) => prev + 1);
        return;
      }

      if (code === kb.forward || code === 'KeyW' || code === 'ArrowUp') setControls((c) => ({ ...c, forward: true }));
      if (code === kb.backward || code === 'KeyS' || code === 'ArrowDown') setControls((c) => ({ ...c, backward: true }));
      if (code === kb.left || code === 'KeyA' || code === 'ArrowLeft') setControls((c) => ({ ...c, left: true }));
      if (code === kb.right || code === 'KeyD' || code === 'ArrowRight') setControls((c) => ({ ...c, right: true }));
      if (code === kb.jump || code === 'Space') setControls((c) => ({ ...c, jump: true, climb: true, parkour: true }));
      if (code === kb.stick || code === 'KeyX') setControls((c) => ({ ...c, parkour: true, climb: true, stick: true, crawl: true }));
      if (code === kb.acrobat || code === 'KeyZ') setControls((c) => ({ ...c, acrobat: true, parkour: true }));
      if (code === kb.swing || code === 'KeyE') setControls((c) => ({ ...c, swing: true }));
      if (code === kb.zip || code === 'KeyQ') setControls((c) => ({ ...c, zip: true }));
      if (code === kb.attack || code === 'KeyF') setControls((c) => ({ ...c, attack: true }));
      if (code === kb.slam || code === 'KeyC') setControls((c) => ({ ...c, slam: true }));
      if (code === kb.dash || code === 'KeyR') setControls((c) => ({ ...c, dash: true }));
      if (code === kb.sprint || code === 'ShiftLeft' || code === 'ShiftRight') {
        setControls((c) => ({ ...c, sprint: true, parkour: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const kb = gameSettings.keybindings;

      if (code === kb.forward || code === 'KeyW' || code === 'ArrowUp') setControls((c) => ({ ...c, forward: false }));
      if (code === kb.backward || code === 'KeyS' || code === 'ArrowDown') setControls((c) => ({ ...c, backward: false }));
      if (code === kb.left || code === 'KeyA' || code === 'ArrowLeft') setControls((c) => ({ ...c, left: false }));
      if (code === kb.right || code === 'KeyD' || code === 'ArrowRight') setControls((c) => ({ ...c, right: false }));
      if (code === kb.jump || code === 'Space') setControls((c) => ({ ...c, jump: false, climb: false, parkour: false }));
      if (code === kb.stick || code === 'KeyX') setControls((c) => ({ ...c, parkour: false, climb: false, stick: false, crawl: false }));
      if (code === kb.acrobat || code === 'KeyZ') setControls((c) => ({ ...c, acrobat: false, parkour: false }));
      if (code === kb.swing || code === 'KeyE') setControls((c) => ({ ...c, swing: false }));
      if (code === kb.zip || code === 'KeyQ') setControls((c) => ({ ...c, zip: false }));
      if (code === kb.attack || code === 'KeyF') setControls((c) => ({ ...c, attack: false }));
      if (code === kb.slam || code === 'KeyC') setControls((c) => ({ ...c, slam: false }));
      if (code === kb.dash || code === 'KeyR') setControls((c) => ({ ...c, dash: false }));
      if (code === kb.sprint || code === 'ShiftLeft' || code === 'ShiftRight') {
        setControls((c) => ({ ...c, sprint: false, parkour: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameSettings, isPhotoModeOpen, isGalleryOpen, playSound, handleToggleCameraMode, handleToggleCinemaBars]);

  // Gamepad / Game Controller Input Polling Loop
  useEffect(() => {
    let animId: number;
    let prevCamBtn = false;
    let prevGreetBtn = false;

    const pollGamepad = () => {
      const gamepads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
      let activeGamepad: Gamepad | null = null;
      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp && gp.connected) {
          activeGamepad = gp;
          break;
        }
      }

      if (activeGamepad) {
        setGamepadConnected(true);
        const axes = activeGamepad.axes;
        const btns = activeGamepad.buttons;

        // Stick Deadzone
        const deadzone = 0.22;
        const stickX = Math.abs(axes[0] || 0) > deadzone ? axes[0] : 0;
        const stickY = Math.abs(axes[1] || 0) > deadzone ? axes[1] : 0;

        // Button mappings
        const btnJump = btns[0]?.pressed; // A / Cross
        const btnSlam = btns[1]?.pressed; // B / Circle
        const btnAttack = btns[2]?.pressed; // X / Square
        const btnZip = btns[3]?.pressed; // Y / Triangle
        const btnGreet = btns[4]?.pressed; // LB
        const btnSprint = btns[5]?.pressed; // RB
        const btnSwing =
          btns[7]?.pressed ||
          (btns[7]?.value ?? 0) > 0.3 ||
          btns[6]?.pressed ||
          (btns[6]?.value ?? 0) > 0.3; // Triggers
        const btnCam = btns[8]?.pressed || btns[11]?.pressed; // Select / R3

        if (btnCam && !prevCamBtn) {
          handleToggleCameraMode();
        }
        prevCamBtn = !!btnCam;

        if (btnGreet && !prevGreetBtn) {
          setActiveInteractionTrigger((prev) => prev + 1);
        }
        prevGreetBtn = !!btnGreet;

        if (!isPhotoModeOpen) {
          setControls((c) => ({
            ...c,
            forward: stickY < -0.3,
            backward: stickY > 0.3,
            left: stickX < -0.3,
            right: stickX > 0.3,
            jump: !!btnJump,
            climb: !!btnJump,
            parkour: !!btnJump || !!btnSprint,
            sprint: !!btnSprint,
            swing: !!btnSwing,
            zip: !!btnZip,
            attack: !!btnAttack,
            slam: !!btnSlam,
          }));
        }
      } else {
        setGamepadConnected(false);
      }

      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animId);
  }, [handleToggleCameraMode, isPhotoModeOpen]);

  // Update control from HUD touch button
  const handleControlChange = useCallback((key: keyof PlayerControls, val: boolean) => {
    setControls((c) => ({ ...c, [key]: val }));
  }, []);

  // Sync realtime score to Firestore leaderboard
  const syncLeaderboard = useCallback(
    (addedScore = 0, addedPizzas = 0, addedKarma = 0, extraCompleted = 0) => {
      const user = auth.currentUser;
      if (!user) return;
      const completedCount = missions.filter((m) => m.completed).length + extraCompleted;
      const totalPizzas = pizza + addedPizzas;
      const totalKarma = heroKarma + addedKarma;
      const totalScore = totalPizzas * 10 + completedCount * 500 + totalKarma * 50 + addedScore;

      setDoc(
        doc(db, 'leaderboard', user.uid),
        {
          userId: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Spider-Hero',
          score: totalScore,
          pizzas: totalPizzas,
          missions: completedCount,
          heroKarma: totalKarma,
          suit: selectedCharacter?.name || 'Classic Suit',
          updatedAt: Date.now(),
        },
        { merge: true }
      ).catch((err) => console.warn('Leaderboard realtime sync notice:', err));
    },
    [missions, pizza, heroKarma, selectedCharacter]
  );

  // Collect Pizza handler
  const handleCollectPizza = useCallback(
    (id: string, pts: number) => {
      setPizzas((prev) =>
        prev.map((p) => (p.id === id ? { ...p, collected: true } : p))
      );
      playSound('pickup');
      onUpdatePizza(pizza + pts);
      syncLeaderboard(pts * 5, pts, 0, 0);
      setNotification(`+${pts} 🍕 PIZZA COLLECTED!`);
      setTimeout(() => setNotification(null), 2500);
    },
    [pizza, onUpdatePizza, playSound, syncLeaderboard]
  );

  // Mission reached handler
  const handleReachMission = useCallback(
    (id: string) => {
      const mission = missions.find((m) => m.id === id);
      if (!mission || mission.completed) return;

      playSound('win');
      setMissions((prev) =>
        prev.map((m) => (m.id === id ? { ...m, completed: true } : m))
      );
      onUpdatePizza(pizza + mission.reward);
      syncLeaderboard(mission.reward * 10, mission.reward, 25, 1);
      triggerAchievement('crime_patrol', 1, 'increment');
      setNotification(`MISSION COMPLETE: +${mission.reward} 🍕!`);
      setTimeout(() => {
        setNotification(null);
        setActiveMissionIndex((idx) => (idx + 1) % missions.length);
      }, 3000);
    },
    [missions, pizza, onUpdatePizza, playSound, syncLeaderboard, triggerAchievement]
  );

  // Telemetry updates from SpiderCharacter
  const handlePositionUpdate = useCallback(
    (
      pos: [number, number, number],
      currentSpeed: number,
      swinging: boolean,
      rotY?: number,
      pState?: ParkourState,
      wNormal?: [number, number, number]
    ) => {
      setPlayerPos(pos);
      setSpeed(currentSpeed);
      setIsSwinging(swinging);
      if (rotY !== undefined) {
        setPlayerRotY(rotY);
      }
      if (pState !== undefined) {
        setParkourState(pState);
      }
      if (wNormal !== undefined) {
        setWallNormal(wNormal);
      }

      // Check high altitude skyscraper apex (e.g. > 65m)
      if (pos[1] >= 65) {
        triggerAchievement('rooftop_climber', Math.round(pos[1]), 'set');
      }
      if (swinging) {
        triggerAchievement('web_swing', 1, 'increment');
      }
    },
    [triggerAchievement]
  );

  // Pedestrian AI Citizen Interaction Completed
  const handleCitizenInteracted = useCallback((karmaReward: number, dialog: string) => {
    setHeroKarma((k) => k + karmaReward);
    syncLeaderboard(karmaReward * 10, 0, karmaReward, 0);
    setNotification(`+${karmaReward} HERO KARMA! "${dialog}"`);
    setTimeout(() => setNotification(null), 3000);
  }, [syncLeaderboard]);

  const handleTriggerCitizenInteraction = useCallback(() => {
    setActiveInteractionTrigger((prev) => prev + 1);
  }, []);

  const handleSyncRealtimeWeather = useCallback((rep: LiveWeatherReport) => {
    setLiveWeatherReport(rep);
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#090d16] overflow-hidden select-none">
      {/* Real-time Daily Bugle Live Broadcast & Weather Ticker (Hidden in Photo Mode for clean framing) */}
      {!isPhotoModeOpen && (
        <DailyBugleBroadcast
          weather={weather}
          onWeatherChange={handleWeatherChange}
          onSyncRealtimeWeather={handleSyncRealtimeWeather}
          isVisible={showLiveBroadcast}
          onToggleVisibility={() => setShowLiveBroadcast((prev) => !prev)}
        />
      )}

      {/* 3D Three.js WebGL Canvas with Real-Time Viewport Filter & GTA V Drag Turn */}
      <div
        className="w-full h-full transition-all duration-300 cursor-grab active:cursor-grabbing"
        style={{ filter: canvasFilter }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <Canvas
          shadows
          camera={{ position: [0, 18, 25], fov: isSwinging ? 75 : 65, near: 0.1, far: 500 }}
          gl={{ preserveDrawingBuffer: true, antialias: true, powerPreference: 'high-performance' }}
        >
          {/* Atmosphere & Sky Fog */}
          <color attach="background" args={['#080c14']} />
          <fog attach="fog" args={['#080c14', 50, 320]} />

          {/* Cinematic Golden-Hour Sun & Skylight */}
          <ambientLight intensity={0.45} />
          <directionalLight
            position={[120, 180, 80]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={10}
            shadow-camera-far={400}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
          />
          <hemisphereLight
            args={['#38bdf8', '#0f172a', 0.6]}
          />

          {/* Procedural City Environment with Dynamic Weather, Crime Combat & Rooftop Props */}
          <CityEnvironment
            buildings={buildings}
            playerPos={playerPos}
            pizzas={pizzas}
            activeMission={activeMission}
            weather={weather}
            isPaused={isPhotoModeOpen}
            activeInteractionTrigger={activeInteractionTrigger}
            isPlayerAttackingOrSlamming={controls.attack || controls.slam}
            isAttacking={controls.attack}
            isSlamming={controls.slam}
            spiderVisionActive={spiderVisionActive}
            onCollectPizza={handleCollectPizza}
            onReachMission={handleReachMission}
            onPedestriansUpdate={setPedestrians}
            onNearbyCitizenChange={setNearbyCitizen}
            onCitizenInteracted={handleCitizenInteracted}
            onBackpackCollected={(name, lore, reward) => {
              onUpdatePizza(pizza + reward);
              setHeroKarma((k) => k + 25);
              setNotification(`🎒 COLLECTIBLE FOUND: ${name}! "${lore}" (+${reward} 🍕)`);
              if (playSound) playSound('rankup');
            }}
            onFastTravel={handleFastTravel}
            playSound={playSound}
          />

          {/* Spider-Man Character Controller with GTA V Movement & Parkour State Machine */}
          <SpiderCharacter
            buildings={buildings}
            controls={controls}
            suitId={selectedCharacter?.id || 'classic'}
            isPaused={isPhotoModeOpen}
            photoPose={photoSettings.pose}
            onPositionUpdate={handlePositionUpdate}
            playSound={playSound}
            turnDelta={turnDelta}
            onParkourStateChange={handleParkourStateChange}
          />

          {/* Dynamic Follow, Cinematic, First-Person & Meta Quest VR Camera */}
          <CameraController
            targetPos={playerPos}
            playerRotY={playerRotY}
            speed={speed}
            isSwinging={isSwinging}
            cameraMode={cameraMode}
            parkourState={parkourState}
            wallNormal={wallNormal}
            photoSettings={photoSettings}
          />

          {/* Real-time Multiplayer Co-Op Roaming Spider-Men */}
          {gameSettings.multiplayerEnabled && (
            <MultiplayerCityPlayers currentSuitId={selectedCharacter?.id || 'classic'} />
          )}
        </Canvas>
      </div>

      {/* Spider-Man Visor HUD or Photo Mode UI */}
      {isPhotoModeOpen ? (
        <PhotoModeUI
          settings={photoSettings}
          weather={weather}
          suitName={selectedCharacter?.name || 'Classic Suit'}
          weatherReport={liveWeatherReport}
          onUpdateSettings={(newSettings) =>
            setPhotoSettings((prev) => ({ ...prev, ...newSettings }))
          }
          onClose={() => {
            setIsPhotoModeOpen(false);
            setPhotoSettings((s) => ({ ...s, active: false }));
          }}
          onOpenGallery={() => setIsGalleryOpen(true)}
          playSound={playSound}
          onSavePhoto={handleSavePhoto}
        />
      ) : (
        <ExploreHUD
          speed={speed}
          altitude={playerPos[1]}
          playerPos={playerPos}
          playerRotY={playerRotY}
          buildings={buildings}
          pizzaCount={pizza}
          suitId={selectedCharacter?.id || 'spider-man-2-classic'}
          suitName={selectedCharacter?.name || 'Classic Suit'}
          activeMission={activeMission}
          pizzas={pizzas}
          pedestrians={pedestrians}
          notification={notification}
          weather={weather}
          autoCycleWeather={autoCycleWeather}
          savedPhotosCount={savedPhotos.length}
          nearbyCitizen={nearbyCitizen}
          heroKarma={heroKarma}
          parkourState={parkourState}
          cameraMode={cameraMode}
          cinemaBars={cinemaBars}
          gamepadConnected={gamepadConnected}
          isMobile={deviceInfo.type === 'mobile_phone' || deviceInfo.type === 'mobile_tablet' || deviceInfo.isTouch}
          spiderVisionActive={spiderVisionActive}
          suitPowerCharge={suitPowerCharge}
          suitPowerActive={suitPowerActive}
          onToggleSpiderVision={handleToggleSpiderVision}
          onActivateSuitPower={handleActivateSuitPower}
          glyphs={activeGlyphs}
          controllerBrand={gamepadInfo.brand}
          onOpenSettings={() => setIsSettingsOpen(true)}
          showLiveBroadcast={showLiveBroadcast}
          onToggleLiveBroadcast={() => setShowLiveBroadcast((prev) => !prev)}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
          onOpenHolidayBonuses={() => setIsHolidayBonusesOpen(true)}
          onInteractWithCitizen={handleTriggerCitizenInteraction}
          onWeatherChange={handleWeatherChange}
          onToggleAutoCycle={() => setAutoCycleWeather((c) => !c)}
          onOpenPhotoMode={() => {
            setIsPhotoModeOpen(true);
            setPhotoSettings((s) => ({ ...s, active: true }));
            playSound('shutter');
          }}
          onOpenGallery={() => setIsGalleryOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onToggleCameraMode={handleToggleCameraMode}
          onToggleCinemaBars={handleToggleCinemaBars}
          onClimbAction={handleClimbAction}
          onControlChange={handleControlChange}
          onExit={onExit}
          onOpenSuits={onOpenCharacterSelection}
        />
      )}

      {/* See-Through PlayStation Touch Overlay (Optimized for Mobile Phones iOS & Android) */}
      {!isPhotoModeOpen && (
        <PlayStationTouchOverlay
          deviceInfo={deviceInfo}
          onControlChange={handleControlChange}
          parkourState={parkourState}
          cameraMode={cameraMode}
          onToggleCameraMode={handleToggleCameraMode}
          onOpenPhotoMode={() => {
            setIsPhotoModeOpen(true);
            setPhotoSettings((s) => ({ ...s, active: true }));
            playSound('shutter');
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onInteractWithCitizen={handleTriggerCitizenInteraction}
          nearbyCitizen={!!nearbyCitizen}
          onClimbAction={handleClimbAction}
        />
      )}

      {/* Real-time Milestone Pop-up Notification */}
      <AchievementToast
        achievement={recentAchievement}
        onDismiss={() => setRecentAchievement(null)}
        onViewAchievements={() => {
          setRecentAchievement(null);
          setIsAchievementsOpen(true);
        }}
      />

      {/* Achievements System Modal in 3D */}
      {isAchievementsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <Achievements
            pizza={pizza}
            onUpdatePizza={onUpdatePizza}
            onClose={() => setIsAchievementsOpen(false)}
          />
        </div>
      )}

      {/* Realtime Firestore Leaderboard Modal in 3D */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <Leaderboard onClose={() => setIsLeaderboardOpen(false)} />
        </div>
      )}

      {/* Holiday & Occasion Pizza Calendar Bonuses Modal */}
      <HolidayPizzaBonusesModal
        isOpen={isHolidayBonusesOpen}
        onClose={() => setIsHolidayBonusesOpen(false)}
        pizza={pizza}
        onUpdatePizza={onUpdatePizza}
        onBonusClaimed={(name, amount) => {
          setNotification(`🎉 CLAIMED ${name.toUpperCase()} BONUS: +${amount} 🍕!`);
          setTimeout(() => setNotification(null), 3500);
        }}
      />

      {/* Spider-Man Photo Archive Modal */}
      {isGalleryOpen && (
        <PhotoGalleryModal
          photos={savedPhotos}
          onClose={() => setIsGalleryOpen(false)}
          onDeletePhoto={handleDeletePhoto}
        />
      )}

      {/* Universal Settings, Device Detector, Key Remapper & Save Data Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={gameSettings}
        onUpdateSettings={handleUpdateSettings}
        deviceInfo={deviceInfo}
        gamepadState={gamepadInfo}
        onLoadSaveData={handleLoadSpideySaveData}
        currentSaveState={{
          version: '1.2.0',
          pizza,
          karma: heroKarma,
          unlockedSuits: ['classic', 'raimi_2002', 'raimi_black_2007', 'tasm1_2012', 'tasm2_2014', 'mcu_stark_2017', 'mcu_stealth_2019', 'mcu_upgraded_2019', 'mcu_integrated_2021', 'mcu_final_swing_2021', 'brand_new_day_2025', 'symbiote', 'miles_morales', 'spider_gwen', 'spider_2099', 'iron_spider'],
          settings: gameSettings,
          photos: savedPhotos,
        }}
      />
    </div>
  );
}
