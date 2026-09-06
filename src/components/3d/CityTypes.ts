export interface BuildingData {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  windowColor: string;
  hasWaterTower?: boolean;
  hasAntenna?: boolean;
  roofAnchor: [number, number, number];
}

export interface PizzaPickup {
  id: string;
  position: [number, number, number];
  collected: boolean;
  points: number;
}

export interface CrimeMission {
  id: string;
  title: string;
  description: string;
  location: [number, number, number];
  type: 'thug_ambush' | 'time_trial' | 'pizza_delivery' | 'hostage_rescue';
  reward: number;
  completed: boolean;
}

export interface PlayerControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  swing: boolean;
  zip: boolean;
  attack: boolean;
  slam: boolean;
  sprint: boolean;
  dash?: boolean;
  parkour?: boolean;
  climb?: boolean;
  crawl?: boolean;
  stick?: boolean;
  acrobat?: boolean;
}

export type ParkourState =
  | 'none'
  | 'wall_stick'
  | 'wall_crawl'
  | 'wall_climb'
  | 'wall_run_up'
  | 'wall_run_horizontal'
  | 'wall_jump'
  | 'wall_acrobat'
  | 'vaulting'
  | 'ledge_hang'
  | 'ledge_climb';

export interface ParkourData {
  state: ParkourState;
  wallNormal: [number, number, number];
  wallPoint: [number, number, number];
  progress: number;
  obstacleHeight?: number;
  horizontalDir?: 'left' | 'right';
}

export type CameraMode = 'cinematic' | 'action' | 'drone' | 'first_person' | 'vr_quest';

export type WeatherType = 'clear' | 'rain' | 'snow';

export interface WeatherZone {
  id: string;
  name: string;
  district: string;
  weather: WeatherType;
  center: [number, number]; // [x, z] coordinates
  radius: number;
  color: string;
  radarColor: string;
  description: string;
}

export const MANHATTAN_WEATHER_ZONES: WeatherZone[] = [
  {
    id: 'zone_midtown',
    name: 'Midtown & Times Square',
    district: 'Midtown Manhattan',
    weather: 'clear',
    center: [0, 0],
    radius: 70,
    color: '#f59e0b',
    radarColor: 'rgba(245, 158, 11, 0.22)',
    description: 'Golden sunlight piercing between skyscraper glass facades',
  },
  {
    id: 'zone_financial',
    name: 'Financial District & Harbor',
    district: 'Lower Manhattan',
    weather: 'rain',
    center: [10, 85],
    radius: 75,
    color: '#0284c7',
    radarColor: 'rgba(2, 132, 199, 0.25)',
    description: 'Sudden coastal Atlantic rain squall washing over Wall St and docks',
  },
  {
    id: 'zone_uptown',
    name: 'Central Park & Uptown',
    district: 'Upper Manhattan',
    weather: 'snow',
    center: [-10, -85],
    radius: 75,
    color: '#a5b4fc',
    radarColor: 'rgba(165, 180, 252, 0.25)',
    description: 'Crisp winter blizzard flurry blanketing parks and brownstones',
  },
];

export interface WeatherConfig {
  type: WeatherType;
  label: string;
  icon: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  skyColor: string;
  sunColor: string;
  sunIntensity: number;
  ambientIntensity: number;
  hemisphereSky: string;
  hemisphereGround: string;
  groundColor: string;
  groundRoughness: number;
  groundMetalness: number;
  pedestrianBehavior: string;
}

export type PedestrianBehaviorState =
  | 'walking'
  | 'cheering'
  | 'paparazzi'
  | 'highfive'
  | 'scared'
  | 'chatting';

export interface PedestrianData {
  id: string;
  name: string;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  speed: number;
  rotY: number;
  bodyColor: string;
  pantsColor: string;
  umbrellaColor: string;
  hatColor?: string;
  hasHat: boolean;
  walkOffset: number;
  isScared: boolean;
  speechBubble?: string | null;
  speechTimer?: number;
  state: PedestrianBehaviorState;
  reactionTimer?: number;
  hasInteracted?: boolean;
  phoneFlash?: boolean;
}

export interface NearbyCitizenPrompt {
  id: string;
  name: string;
  distance: number;
  actionText: string;
  quote: string;
}

export type PhotoModePose =
  | 'action'
  | 'crouch'
  | 'thwip'
  | 'hang'
  | 'heroic'
  | 'selfie';

export type PhotoFilterType =
  | 'none'
  | 'sepia'
  | 'high_contrast'
  | 'black_and_white'
  | 'noir'
  | 'comic'
  | 'cyberpunk'
  | 'golden'
  | 'popart';

export interface JJJBroadcastQuote {
  id: string;
  quote: string;
  movie: string;
  context: string;
  intensity: 'raging' | 'scandalous' | 'editorial';
}

export interface LiveWeatherReport {
  timezone: string;
  city: string;
  localTimeStr: string;
  dateStr: string;
  weatherType: WeatherType;
  temperatureF: number;
  temperatureC: number;
  conditionDescription: string;
  timeOfDay: 'dawn' | 'day' | 'golden_hour' | 'night';
  isAutoSynced: boolean;
  jjjReport: {
    headline: string;
    quote: JJJBroadcastQuote;
  };
}

export type PhotoFrameType =
  | 'none'
  | 'bugle'
  | 'comic_panel'
  | 'cinematic'
  | 'polaroid'
  | 'spidey_stamp';

export type PhotoStickerType =
  | 'none'
  | 'thwip'
  | 'boom'
  | 'bugle_stamp'
  | 'friendly_hero'
  | 'spidey_logo';

export interface PhotoSettings {
  active: boolean;
  fov: number; // 25 to 90
  distance: number; // 3 to 28
  height: number; // -3 to 10
  orbitAngle: number; // 0 to 360 in degrees
  tilt: number; // -45 to 45 degrees
  pose: PhotoModePose;
  filter: PhotoFilterType;
  frame: PhotoFrameType;
  sticker: PhotoStickerType;
  showGrid: boolean;
  vignette: boolean;
}

export interface SavedPhoto {
  id: string;
  dataUrl: string;
  date: string;
  weather: WeatherType;
  suitName: string;
  filter: PhotoFilterType;
  caption: string;
}

