export type Character = {
  id: string;
  name: string;
  movie: string;
  year: number;
  description: string;
  thumbnail: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Cinematic';
  primaryColor: string;
  secondaryColor: string;
  eyeColor: string;
  emblemColor: string;
  webColor: string;
  texturePattern: 'classic_web' | 'raimi_silver_3d' | 'symbiote_black' | 'tasm_hex' | 'tasm2_highdef' | 'stark_tech' | 'stealth_matte' | 'gold_integrated' | 'shiny_metallic' | 'comic_vibrant';
};

export const AVAILABLE_CHARACTERS: Character[] = [
  {
    id: 'spiderman-1',
    name: 'Spider-Man 1 (2002)',
    movie: 'Spider-Man (Tobey Maguire)',
    year: 2002,
    description: 'The iconic Raimi suit with raised 3D silver webbing and angular silver-framed lenses.',
    thumbnail: '🕸️',
    rarity: 'Cinematic',
    primaryColor: '#c81e1e',
    secondaryColor: '#1e3a8a',
    eyeColor: '#e2e8f0',
    emblemColor: '#0f172a',
    webColor: '#cbd5e1',
    texturePattern: 'raimi_silver_3d',
  },
  {
    id: 'spiderman-2',
    name: 'Spider-Man 2 (2004)',
    movie: 'Spider-Man 2 (Tobey Maguire)',
    year: 2004,
    description: 'Refined scarlet red and royal blue Raimi masterpiece with high-contrast web piping.',
    thumbnail: '🕷️',
    rarity: 'Cinematic',
    primaryColor: '#dc2626',
    secondaryColor: '#1d4ed8',
    eyeColor: '#f1f5f9',
    emblemColor: '#0f172a',
    webColor: '#e2e8f0',
    texturePattern: 'raimi_silver_3d',
  },
  {
    id: 'spiderman-3-black',
    name: 'Spider-Man 3 Black Suit (2007)',
    movie: 'Spider-Man 3 (Symbiote)',
    year: 2007,
    description: 'Alien symbiote-bonded suit with aggressive jagged chest spider and obsidian gloss.',
    thumbnail: '🖤',
    rarity: 'Legendary',
    primaryColor: '#09090b',
    secondaryColor: '#18181b',
    eyeColor: '#ffffff',
    emblemColor: '#ffffff',
    webColor: '#71717a',
    texturePattern: 'symbiote_black',
  },
  {
    id: 'tasm-1',
    name: 'The Amazing Spider-Man (2012)',
    movie: 'TASM 1 (Andrew Garfield)',
    year: 2012,
    description: 'Handmade athletic texture with yellow amber sunglass lenses and streamlined spider legs.',
    thumbnail: '⚡',
    rarity: 'Cinematic',
    primaryColor: '#b91c1c',
    secondaryColor: '#1e293b',
    eyeColor: '#fbbf24',
    emblemColor: '#0f172a',
    webColor: '#334155',
    texturePattern: 'tasm_hex',
  },
  {
    id: 'tasm-2',
    name: 'The Amazing Spider-Man 2 (2014)',
    movie: 'TASM 2 (Andrew Garfield)',
    year: 2014,
    description: 'Beloved oversized expressive white lenses with vivid crimson fabric and deep navy.',
    thumbnail: '🌟',
    rarity: 'Cinematic',
    primaryColor: '#ef4444',
    secondaryColor: '#1e40af',
    eyeColor: '#ffffff',
    emblemColor: '#0f172a',
    webColor: '#1e293b',
    texturePattern: 'tasm2_highdef',
  },
  {
    id: 'homecoming',
    name: 'Homecoming Stark Tech (2017)',
    movie: 'Spider-Man: Homecoming (Tom Holland)',
    year: 2017,
    description: 'Tony Stark-engineered high-tech suit featuring animated mechanical shutter lenses.',
    thumbnail: '🦾',
    rarity: 'Cinematic',
    primaryColor: '#e11d48',
    secondaryColor: '#2563eb',
    eyeColor: '#ffffff',
    emblemColor: '#0f172a',
    webColor: '#0f172a',
    texturePattern: 'stark_tech',
  },
  {
    id: 'far-from-home',
    name: 'Far From Home Upgraded (2019)',
    movie: 'Spider-Man: Far From Home',
    year: 2019,
    description: 'Custom-fabricated stealth suit with aerodynamic matte black and crimson red panels.',
    thumbnail: '🕶️',
    rarity: 'Cinematic',
    primaryColor: '#b91c1c',
    secondaryColor: '#18181b',
    eyeColor: '#ffffff',
    emblemColor: '#ffffff',
    webColor: '#09090b',
    texturePattern: 'stealth_matte',
  },
  {
    id: 'no-way-home',
    name: 'No Way Home Integrated Suit (2021)',
    movie: 'Spider-Man: No Way Home',
    year: 2021,
    description: 'Nano-tech infused suit with gleaming gold chest emblem and Sorcerer mystic enhancements.',
    thumbnail: '✨',
    rarity: 'Legendary',
    primaryColor: '#dc2626',
    secondaryColor: '#18181b',
    eyeColor: '#ffffff',
    emblemColor: '#eab308',
    webColor: '#ca8a04',
    texturePattern: 'gold_integrated',
  },
  {
    id: 'no-way-home-final',
    name: 'No Way Home Final Swing (2021)',
    movie: 'Spider-Man: No Way Home (Ending)',
    year: 2021,
    description: 'Hand-stitched classic red and iridescent metallic blue swinging through NYC snow.',
    thumbnail: '❄️',
    rarity: 'Legendary',
    primaryColor: '#e11d48',
    secondaryColor: '#0284c7',
    eyeColor: '#f8fafc',
    emblemColor: '#0f172a',
    webColor: '#0f172a',
    texturePattern: 'shiny_metallic',
  },
  {
    id: 'brand-new-day',
    name: 'Brand New Day / Fresh Start',
    movie: 'Marvel Comics: Brand New Day Era',
    year: 2025,
    description: 'Ultra-bright vivid classic comic suit with neon luminescent eyes and bold web contours.',
    thumbnail: '☀️',
    rarity: 'Legendary',
    primaryColor: '#f43f5e',
    secondaryColor: '#0ea5e9',
    eyeColor: '#38bdf8',
    emblemColor: '#0284c7',
    webColor: '#0284c7',
    texturePattern: 'comic_vibrant',
  },
  {
    id: 'night-monkey',
    name: 'Night Monkey Stealth Suit (2019)',
    movie: 'Spider-Man: Far From Home (Prague)',
    year: 2019,
    description: 'S.H.I.E.L.D. tactical black stealth fabric with flip-up night-vision optical goggles.',
    thumbnail: '🥷',
    rarity: 'Cinematic',
    primaryColor: '#18181b',
    secondaryColor: '#09090b',
    eyeColor: '#a1a1aa',
    emblemColor: '#27272a',
    webColor: '#27272a',
    texturePattern: 'stealth_matte',
  },
  {
    id: 'miles-morales',
    name: 'Miles Morales (Spider-Verse)',
    movie: 'Into the Spider-Verse (2018)',
    year: 2018,
    description: 'Matte black fabric with spray-painted crimson graffiti chest spider and Chicago red detailing.',
    thumbnail: '👟',
    rarity: 'Legendary',
    primaryColor: '#18181b',
    secondaryColor: '#dc2626',
    eyeColor: '#ffffff',
    emblemColor: '#ef4444',
    webColor: '#ef4444',
    texturePattern: 'stealth_matte',
  },
  {
    id: 'spider-gwen',
    name: 'Ghost-Spider (Gwen Stacy)',
    movie: 'Across the Spider-Verse (2023)',
    year: 2023,
    description: 'Sleek white and deep obsidian hooded suit with cyan-and-magenta web-patterned interior.',
    thumbnail: '🌸',
    rarity: 'Legendary',
    primaryColor: '#f8fafc',
    secondaryColor: '#0f172a',
    eyeColor: '#ec4899',
    emblemColor: '#06b6d4',
    webColor: '#ec4899',
    texturePattern: 'shiny_metallic',
  },
  {
    id: 'spider-2099',
    name: 'Spider-Man 2099 (Miguel O\'Hara)',
    movie: 'Spider-Man 2099 (Nueva York)',
    year: 2099,
    description: 'Futuristic unstable molecule dark blue suit with skull-spider red neon crest and forearm talons.',
    thumbnail: '⚡',
    rarity: 'Legendary',
    primaryColor: '#1e1b4b',
    secondaryColor: '#dc2626',
    eyeColor: '#ef4444',
    emblemColor: '#dc2626',
    webColor: '#ef4444',
    texturePattern: 'shiny_metallic',
  },
  {
    id: 'iron-spider',
    name: 'Iron Spider Armor (2018)',
    movie: 'Avengers: Infinity War (Stark Tech)',
    year: 2018,
    description: 'Nano-tech Stark armor with polished metallic crimson, cobalt blue, and shimmering gold trim.',
    thumbnail: '🦾',
    rarity: 'Legendary',
    primaryColor: '#b91c1c',
    secondaryColor: '#1e3a8a',
    eyeColor: '#38bdf8',
    emblemColor: '#eab308',
    webColor: '#eab308',
    texturePattern: 'gold_integrated',
  },
];

export type ShopItem = {
  id: string;
  name: string;
  type: 'Suit' | 'Fragment';
  cost: number;
};

export type Skill = {
  id: string;
  name: string;
  type: 'Basic' | 'Advanced' | 'Elite' | 'Ultimate';
  cost: number;
  unlocked: boolean;
};

export interface CustomKeybindings {
  forward: string;
  backward: string;
  left: string;
  right: string;
  jump: string;
  swing: string;
  sprint: string;
  dash: string;
  zip: string;
  attack: string;
  slam: string;
  stick: string;
  acrobat: string;
  camera: string;
  photo: string;
}

export const DEFAULT_KEYBINDINGS: CustomKeybindings = {
  forward: 'KeyW',
  backward: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  jump: 'Space',
  swing: 'ShiftLeft',
  sprint: 'KeyE',
  dash: 'KeyR',
  zip: 'KeyF',
  attack: 'KeyQ',
  slam: 'KeyC',
  stick: 'KeyX',
  acrobat: 'KeyZ',
  camera: 'KeyV',
  photo: 'KeyP',
};

export interface GameSettings {
  multiplayerEnabled: boolean;
  vrModeEnabled: boolean;
  firstPersonCamera: boolean;
  autoSaveEnabled: boolean;
  touchLayout: 'playstation' | 'xbox' | 'numeric';
  keybindings: CustomKeybindings;
  masterVolume: number;
  hapticFeedback: boolean;
}

export interface SpideySaveData {
  formatVersion: 'spidey_v1.0';
  timestamp: string;
  userEmail?: string;
  pizza: number;
  karma?: number;
  photos?: any[];
  selectedCharacterId: string;
  unlockedCharacterIds: string[];
  skills: Skill[];
  settings: GameSettings;
  stats: {
    totalSwings: number;
    distanceTraveledMeters: number;
    photosTaken: number;
    enemiesDefeated: number;
    highestSpeedMph: number;
    wallRunsCompleted: number;
  };
}
