export type FighterId =
  | 'spiderman_peter'
  | 'spiderman_miles'
  | 'venom'
  | 'green_goblin'
  | 'doc_ock'
  | 'kraven'
  | 'kingpin';

export type AttackType =
  | 'lp' // 1: Left Punch / Web Jab
  | 'rp' // 2: Right Punch / Straight Cross
  | 'lk' // 3: Left Kick / Low Sweep
  | 'rk' // 4: Right Kick / Rising High Launcher
  | 'heat_burst' // 1+2: Heat Burst
  | 'heat_smash' // During Heat: Heat Smash finisher
  | 'rage_art' // 3+4: Rage Art Cinematic
  | 'throw' // 1+3: Command Grab
  | 'parry' // Guard counter
  | 'sidestep_left'
  | 'sidestep_right'
  | 'tag_switch'; // Tag in secondary partner

export type MatchTimerSetting = 30 | 60 | 99 | 'infinite';
export type MatchTeamMode = 'solo' | 'tag';

export interface MoveData {
  id: string;
  name: string;
  command: string; // e.g., "1, 2", "df+2", "3+4", "Heat Burst"
  damage: number;
  type: 'high' | 'mid' | 'low' | 'special' | 'throw' | 'rage';
  isLauncher?: boolean;
  isWallSplat?: boolean;
  isHeatEngager?: boolean;
  isArmor?: boolean;
  hitStun: number; // frames
  blockAdvantage: number; // +3, -12 etc.
  description: string;
}

export interface FighterArchetype {
  id: FighterId;
  name: string;
  alias: string;
  title: string;
  country: string;
  style: string;
  avatar: string;
  primaryColor: string;
  secondaryColor: string;
  heatColor: string;
  difficulty: 'Easy' | 'Intermediate' | 'Hard' | 'Master';
  stats: {
    power: number;
    speed: number;
    reach: number;
    juggle: number;
    defense: number;
  };
  introQuote: string;
  winQuote: string;
  moves: MoveData[];
}

export interface ArenaStage {
  id: string;
  name: string;
  subtitle: string;
  location: string;
  groundColor: string;
  wallColor: string;
  skyColor: string;
  accentColor: string;
  musicTheme: string;
  hasWallBreak: boolean;
  hasFloorBreak: boolean;
}

export interface TekkenRank {
  tier: number;
  name: string;
  dan: string;
  category: 'Beginner' | 'Silver' | 'Teal' | 'Green' | 'Yellow' | 'Orange' | 'Red' | 'Ruler' | 'Blue' | 'Gold' | 'Supreme';
  color: string;
  badgeBg: string;
  requiredRP: number;
}

export const TEKKEN_RANKS: TekkenRank[] = [
  { tier: 1, name: 'Beginner', dan: 'Beginner', category: 'Beginner', color: '#94a3b8', badgeBg: 'from-slate-700 to-slate-900', requiredRP: 0 },
  { tier: 2, name: '1st Dan', dan: '1st Dan', category: 'Silver', color: '#cbd5e1', badgeBg: 'from-zinc-500 to-zinc-800', requiredRP: 400 },
  { tier: 3, name: '2nd Dan', dan: '2nd Dan', category: 'Silver', color: '#e2e8f0', badgeBg: 'from-zinc-400 to-zinc-700', requiredRP: 800 },
  { tier: 4, name: 'Combatant', dan: 'Combatant', category: 'Teal', color: '#2dd4bf', badgeBg: 'from-teal-600 to-cyan-900', requiredRP: 1400 },
  { tier: 5, name: 'Brawler', dan: 'Brawler', category: 'Green', color: '#4ade80', badgeBg: 'from-emerald-600 to-emerald-950', requiredRP: 2200 },
  { tier: 6, name: 'Ranger', dan: 'Ranger', category: 'Green', color: '#22c55e', badgeBg: 'from-green-600 to-green-950', requiredRP: 3100 },
  { tier: 7, name: 'Cavalry', dan: 'Cavalry', category: 'Green', color: '#16a34a', badgeBg: 'from-lime-600 to-emerald-900', requiredRP: 4200 },
  { tier: 8, name: 'Warrior', dan: 'Warrior', category: 'Yellow', color: '#facc15', badgeBg: 'from-amber-500 to-yellow-900', requiredRP: 5500 },
  { tier: 9, name: 'Knight', dan: 'Knight', category: 'Yellow', color: '#eab308', badgeBg: 'from-yellow-500 to-amber-950', requiredRP: 7000 },
  { tier: 10, name: 'Dominator', dan: 'Dominator', category: 'Yellow', color: '#ca8a04', badgeBg: 'from-amber-600 to-orange-950', requiredRP: 8800 },
  { tier: 11, name: 'Vanquisher', dan: 'Vanquisher', category: 'Orange', color: '#fb923c', badgeBg: 'from-orange-500 to-red-950', requiredRP: 11000 },
  { tier: 12, name: 'Destroyer', dan: 'Destroyer', category: 'Orange', color: '#f97316', badgeBg: 'from-orange-600 to-amber-950', requiredRP: 13500 },
  { tier: 13, name: 'Eliminator', dan: 'Eliminator', category: 'Orange', color: '#ea580c', badgeBg: 'from-red-600 to-orange-950', requiredRP: 16500 },
  { tier: 14, name: 'Garyu', dan: 'Garyu', category: 'Red', color: '#ef4444', badgeBg: 'from-red-600 to-rose-950', requiredRP: 20000 },
  { tier: 15, name: 'Shinryu', dan: 'Shinryu', category: 'Red', color: '#dc2626', badgeBg: 'from-red-700 to-red-950', requiredRP: 24000 },
  { tier: 16, name: 'Tenryu', dan: 'Tenryu', category: 'Red', color: '#b91c1c', badgeBg: 'from-rose-700 to-red-950', requiredRP: 28500 },
  { tier: 17, name: 'Mighty Ruler', dan: 'Mighty Ruler', category: 'Ruler', color: '#c084fc', badgeBg: 'from-purple-600 to-purple-950', requiredRP: 33500 },
  { tier: 18, name: 'Flame Ruler', dan: 'Flame Ruler', category: 'Ruler', color: '#a855f7', badgeBg: 'from-fuchsia-600 to-purple-950', requiredRP: 39000 },
  { tier: 19, name: 'Battle Ruler', dan: 'Battle Ruler', category: 'Ruler', color: '#9333ea', badgeBg: 'from-violet-600 to-purple-950', requiredRP: 45000 },
  { tier: 20, name: 'Fujin', dan: 'Fujin', category: 'Blue', color: '#60a5fa', badgeBg: 'from-blue-600 to-blue-950', requiredRP: 52000 },
  { tier: 21, name: 'Raijin', dan: 'Raijin', category: 'Blue', color: '#3b82f6', badgeBg: 'from-cyan-600 to-blue-950', requiredRP: 60000 },
  { tier: 22, name: 'Bushin', dan: 'Bushin', category: 'Blue', color: '#2563eb', badgeBg: 'from-indigo-600 to-blue-950', requiredRP: 69000 },
  { tier: 23, name: 'Tekken King', dan: 'Tekken King', category: 'Gold', color: '#fbbf24', badgeBg: 'from-amber-400 via-yellow-500 to-yellow-950', requiredRP: 79000 },
  { tier: 24, name: 'Tekken Emperor', dan: 'Tekken Emperor', category: 'Gold', color: '#f59e0b', badgeBg: 'from-yellow-400 via-amber-600 to-orange-950', requiredRP: 90000 },
  { tier: 25, name: 'God of Destruction', dan: 'God of Destruction', category: 'Supreme', color: '#f43f5e', badgeBg: 'from-rose-500 via-purple-600 to-amber-500', requiredRP: 105000 },
];

export const FIGHTER_ROSTER: FighterArchetype[] = [
  {
    id: 'spiderman_peter',
    name: 'Spider-Man',
    alias: 'Peter Parker',
    title: 'Your Friendly Neighborhood Hero',
    country: 'Queens, New York',
    style: 'Acrobatic Web-Freestyle & Spider-Sense',
    avatar: '🕷️',
    primaryColor: '#ef4444',
    secondaryColor: '#2563eb',
    heatColor: '#38bdf8',
    difficulty: 'Easy',
    stats: { power: 85, speed: 96, reach: 88, juggle: 98, defense: 84 },
    introQuote: "Let's see if your moves can keep up with Spider-Sense!",
    winQuote: "Just your friendly neighborhood wall-crawler signing off.",
    moves: [
      { id: 'p_1', name: 'Web Jab (1)', command: '1', damage: 12, type: 'high', hitStun: 14, blockAdvantage: 1, description: 'Fast 10-frame high jab for quick interrupts' },
      { id: 'p_2', name: 'Acrobatic Cross (2)', command: '2', damage: 18, type: 'mid', hitStun: 18, blockAdvantage: -2, description: 'Solid mid strike with strong tracking' },
      { id: 'p_3', name: 'Web-Sweep Low (3)', command: '3', damage: 16, type: 'low', hitStun: 20, blockAdvantage: -11, description: 'Low sweep kick that ducks under highs' },
      { id: 'p_4', name: 'Somersault Launcher (4)', command: '4', damage: 25, type: 'mid', isLauncher: true, hitStun: 45, blockAdvantage: -13, description: 'Classic upward launcher initiating high aerial juggles' },
      { id: 'p_heat', name: 'Heat Burst: Web Quake', command: '1+2', damage: 32, type: 'special', isHeatEngager: true, isArmor: true, hitStun: 30, blockAdvantage: 2, description: 'Power crush burst granting Heat status & blue aura' },
      { id: 'p_smash', name: 'Heat Smash: Web Barrage', command: 'Heat 2+3', damage: 55, type: 'special', isWallSplat: true, hitStun: 50, blockAdvantage: 4, description: 'Consumes heat to unleash a crushing cinematic web barrage' },
      { id: 'p_rage', name: 'Rage Art: Maximum Spider', command: '3+4', damage: 85, type: 'rage', isArmor: true, hitStun: 80, blockAdvantage: -25, description: 'Cinematic super move usable when health drops below 25%' },
      { id: 'p_throw', name: 'Web Sling Toss', command: '1+3', damage: 35, type: 'throw', hitStun: 35, blockAdvantage: 0, description: 'Unblockable command throw spinning the enemy into the wall' },
    ],
  },
  {
    id: 'spiderman_miles',
    name: 'Miles Morales',
    alias: 'Spider-Man II',
    title: 'The Brooklyn Electric Prodigy',
    country: 'Brooklyn, New York',
    style: 'Bio-Electric Venom Martial Arts',
    avatar: '⚡',
    primaryColor: '#0f172a',
    secondaryColor: '#ef4444',
    heatColor: '#eab308',
    difficulty: 'Intermediate',
    stats: { power: 90, speed: 94, reach: 85, juggle: 95, defense: 82 },
    introQuote: "Brooklyn in the house! Let's light up the ring!",
    winQuote: "That was electric! Still gotta catch up on homework though.",
    moves: [
      { id: 'm_1', name: 'Bio-Zap Jab (1)', command: '1', damage: 13, type: 'high', hitStun: 15, blockAdvantage: 2, description: 'Stun jab laced with static charge' },
      { id: 'm_2', name: 'Venom Punch (2)', command: '2', damage: 20, type: 'mid', hitStun: 22, blockAdvantage: 0, description: 'Electrified mid straight' },
      { id: 'm_3', name: 'Venom Slide (3)', command: '3', damage: 17, type: 'low', hitStun: 22, blockAdvantage: -10, description: 'Dashing low slide' },
      { id: 'm_4', name: 'Venom Jump Launcher (4)', command: '4', damage: 26, type: 'mid', isLauncher: true, hitStun: 46, blockAdvantage: -12, description: 'Rising electric knee launching into airborne juggle' },
      { id: 'm_heat', name: 'Heat Burst: Mega Venom', command: '1+2', damage: 34, type: 'special', isHeatEngager: true, isArmor: true, hitStun: 32, blockAdvantage: 3, description: 'Shockwave pulse activating golden Heat mode' },
      { id: 'm_smash', name: 'Heat Smash: Thunder Strike', command: 'Heat 2+3', damage: 58, type: 'special', isWallSplat: true, hitStun: 52, blockAdvantage: 5, description: 'Heavy thunder blast smashing target across the arena' },
      { id: 'm_rage', name: 'Rage Art: Venom Overdrive', command: '3+4', damage: 88, type: 'rage', isArmor: true, hitStun: 80, blockAdvantage: -25, description: 'Full bio-electric detonation devastating the arena' },
      { id: 'm_throw', name: 'Electric Piledriver', command: '1+3', damage: 38, type: 'throw', hitStun: 35, blockAdvantage: 0, description: 'Shocks and slams opponent head-first' },
    ],
  },
  {
    id: 'venom',
    name: 'Venom',
    alias: 'Eddie Brock & Symbiote',
    title: 'The Lethal Protector',
    country: 'San Francisco / Manhattan',
    style: 'Symbiotic Brutality & Heavy Devour',
    avatar: '👅',
    primaryColor: '#020617',
    secondaryColor: '#ffffff',
    heatColor: '#a855f7',
    difficulty: 'Intermediate',
    stats: { power: 100, speed: 78, reach: 95, juggle: 82, defense: 98 },
    introQuote: "WE... WILL TEAR YOU TO PIECES!",
    winQuote: "Eyes, lungs, pancreas... so many snacks, so little time!",
    moves: [
      { id: 'v_1', name: 'Claw Swipe (1)', command: '1', damage: 15, type: 'high', hitStun: 16, blockAdvantage: 0, description: 'Vicious high claw slash' },
      { id: 'v_2', name: 'Symbiote Hammer (2)', command: '2', damage: 24, type: 'mid', hitStun: 24, blockAdvantage: -3, description: 'Heavy overhead hammer smash' },
      { id: 'v_3', name: 'Tendril Sweep (3)', command: '3', damage: 20, type: 'low', hitStun: 25, blockAdvantage: -12, description: 'Black tendril sweeping across the floor' },
      { id: 'v_4', name: 'Roaring Uppercut (4)', command: '4', damage: 30, type: 'mid', isLauncher: true, hitStun: 48, blockAdvantage: -15, description: 'Massive armored uppercut launching foe high into air' },
      { id: 'v_heat', name: 'Heat Burst: Symbiote Rage', command: '1+2', damage: 38, type: 'special', isHeatEngager: true, isArmor: true, hitStun: 35, blockAdvantage: 4, description: 'Unleashes dark symbiote spikes with purple Heat flame' },
      { id: 'v_smash', name: 'Heat Smash: Devourer Slam', command: 'Heat 2+3', damage: 65, type: 'special', isWallSplat: true, hitStun: 55, blockAdvantage: 6, description: 'Smothers and crushes foe with massive symbiote fist' },
      { id: 'v_rage', name: 'Rage Art: "WE ARE VENOM"', command: '3+4', damage: 92, type: 'rage', isArmor: true, hitStun: 85, blockAdvantage: -28, description: 'Ferocious multi-tendril cinematic feeding frenzy' },
      { id: 'v_throw', name: 'Brain Eater Grab', command: '1+3', damage: 42, type: 'throw', hitStun: 40, blockAdvantage: 0, description: 'Lifts enemy by throat and smashes into turf' },
    ],
  },
  {
    id: 'green_goblin',
    name: 'Green Goblin',
    alias: 'Norman Osborn',
    title: 'The Glider Tyrant',
    country: 'Oscorp Manhattan',
    style: 'Oscorp Goblin Serum & Pyrotechnic Chaos',
    avatar: '🎭',
    primaryColor: '#15803d',
    secondaryColor: '#7e22ce',
    heatColor: '#84cc16',
    difficulty: 'Hard',
    stats: { power: 92, speed: 90, reach: 92, juggle: 88, defense: 86 },
    introQuote: "Gods don't have to choose... WE TAKE!",
    winQuote: "Poor Peter... too weak to send me home to die!",
    moves: [
      { id: 'g_1', name: 'Serum Jab (1)', command: '1', damage: 13, type: 'high', hitStun: 14, blockAdvantage: 1, description: 'Enhanced strength jab' },
      { id: 'g_2', name: 'Pumpkin Hook (2)', command: '2', damage: 21, type: 'mid', hitStun: 20, blockAdvantage: -1, description: 'Vicious goblin hook' },
      { id: 'g_3', name: 'Razor Bat Sweep (3)', command: '3', damage: 18, type: 'low', hitStun: 22, blockAdvantage: -11, description: 'Low spinning razor slice' },
      { id: 'g_4', name: 'Glider Flip Launcher (4)', command: '4', damage: 28, type: 'mid', isLauncher: true, hitStun: 47, blockAdvantage: -14, description: 'Somersault flip kicking opponent skyward' },
      { id: 'g_heat', name: 'Heat Burst: Oscorp Catalyst', command: '1+2', damage: 35, type: 'special', isHeatEngager: true, isArmor: true, hitStun: 33, blockAdvantage: 3, description: 'Chemical burst ignition triggering toxic green Heat' },
      { id: 'g_smash', name: 'Heat Smash: Pumpkin Carpet', command: 'Heat 2+3', damage: 60, type: 'special', isWallSplat: true, hitStun: 52, blockAdvantage: 4, description: 'Bombards arena with chain explosions' },
      { id: 'g_rage', name: 'Rage Art: Glider Impaler', command: '3+4', damage: 90, type: 'rage', isArmor: true, hitStun: 80, blockAdvantage: -26, description: 'Summons glider for full-speed dive-bomb execution' },
      { id: 'g_throw', name: 'Goblin Choke Slam', command: '1+3', damage: 38, type: 'throw', hitStun: 36, blockAdvantage: 0, description: 'Laughs maniacally while slamming foe down' },
    ],
  },
  {
    id: 'doc_ock',
    name: 'Doctor Octopus',
    alias: 'Dr. Otto Octavius',
    title: 'The Master Planner',
    country: 'Schenectady, New York',
    style: 'Four Neural-Linked Titanium-Steel Arms',
    avatar: '🐙',
    primaryColor: '#047857',
    secondaryColor: '#d97706',
    heatColor: '#06b6d4',
    difficulty: 'Master',
    stats: { power: 94, speed: 82, reach: 100, juggle: 90, defense: 90 },
    introQuote: "The power of the sun... in the palm of my hands!",
    winQuote: "Brilliant, but lazy. You are no match for superior intellect!",
    moves: [
      { id: 'o_1', name: 'Tentacle Thrust (1)', command: '1', damage: 14, type: 'high', hitStun: 15, blockAdvantage: 2, description: 'Long-range titanium arm probe' },
      { id: 'o_2', name: 'Quad Strike (2)', command: '2', damage: 22, type: 'mid', hitStun: 22, blockAdvantage: -2, description: 'Crossed tentacle smash' },
      { id: 'o_3', name: 'Ground Spike (3)', command: '3', damage: 19, type: 'low', hitStun: 24, blockAdvantage: -13, description: 'Tentacle burrowing from underneath' },
      { id: 'o_4', name: 'Hydraulic Uppercut (4)', command: '4', damage: 29, type: 'mid', isLauncher: true, hitStun: 49, blockAdvantage: -14, description: 'Heavy upward launch from dual mechanical tentacles' },
      { id: 'o_heat', name: 'Heat Burst: Neural Overclock', command: '1+2', damage: 36, type: 'special', isHeatEngager: true, isArmor: true, hitStun: 34, blockAdvantage: 3, description: 'Cyan cybernetic wave igniting Heat Mode' },
      { id: 'o_smash', name: 'Heat Smash: Fusion Slam', command: 'Heat 2+3', damage: 62, type: 'special', isWallSplat: true, hitStun: 54, blockAdvantage: 5, description: 'All four arms crush together with magnetic force' },
      { id: 'o_rage', name: 'Rage Art: Superior Domination', command: '3+4', damage: 90, type: 'rage', isArmor: true, hitStun: 82, blockAdvantage: -27, description: 'Pins victim with two arms while drilling with the other two' },
      { id: 'o_throw', name: 'Tentacle Whirlwind', command: '1+3', damage: 40, type: 'throw', hitStun: 38, blockAdvantage: 0, description: 'Hurls opponent across the stage at high velocity' },
    ],
  },
  {
    id: 'kraven',
    name: 'Kraven The Hunter',
    alias: 'Sergei Kravinoff',
    title: 'The Apex Predator',
    country: 'Volgograd, Russia',
    style: 'Tribal Combat, Savage Strikes & Hunting Prowess',
    avatar: '🦁',
    primaryColor: '#b45309',
    secondaryColor: '#78350f',
    heatColor: '#ea580c',
    difficulty: 'Intermediate',
    stats: { power: 96, speed: 86, reach: 89, juggle: 86, defense: 92 },
    introQuote: "Show me you are a true beast, not a mere insect!",
    winQuote: "A worthy hunt... but in the end, Kraven remains apex!",
    moves: [
      { id: 'k_1', name: 'Heavy Jab (1)', command: '1', damage: 14, type: 'high', hitStun: 15, blockAdvantage: 1, description: 'Heavy bone-crushing jab' },
      { id: 'k_2', name: 'Machete Slash (2)', command: '2', damage: 23, type: 'mid', hitStun: 22, blockAdvantage: -2, description: 'Mid cleaving blade strike' },
      { id: 'k_3', name: 'Lion Sweep (3)', command: '3', damage: 19, type: 'low', hitStun: 23, blockAdvantage: -11, description: 'Sweeping leg trip' },
      { id: 'k_4', name: 'Predator Launcher (4)', command: '4', damage: 29, type: 'mid', isLauncher: true, hitStun: 48, blockAdvantage: -13, description: 'Upward spear kick launching opponent' },
      { id: 'k_heat', name: 'Heat Burst: Primal Instinct', command: '1+2', damage: 36, type: 'special', isHeatEngager: true, isArmor: true, hitStun: 34, blockAdvantage: 3, description: 'Roars unleashing orange predatory Heat fire' },
      { id: 'k_smash', name: 'Heat Smash: Hunter Execution', command: 'Heat 2+3', damage: 63, type: 'special', isWallSplat: true, hitStun: 53, blockAdvantage: 5, description: 'Delivers rapid strikes finishing with spear drive' },
      { id: 'k_rage', name: 'Rage Art: The Final Hunt', command: '3+4', damage: 91, type: 'rage', isArmor: true, hitStun: 82, blockAdvantage: -26, description: 'Stalks in slow-motion before delivering fatal blow' },
      { id: 'k_throw', name: 'Spine Breaker', command: '1+3', damage: 41, type: 'throw', hitStun: 38, blockAdvantage: 0, description: 'Hoists target onto shoulders and cracks spine' },
    ],
  },
  {
    id: 'kingpin',
    name: 'Kingpin',
    alias: 'Wilson Fisk',
    title: 'The Crime Syndicate Sovereign',
    country: "Hell's Kitchen, New York",
    style: '350lbs Pure Muscle Sumo & Street Brawling',
    avatar: '👔',
    primaryColor: '#f8fafc',
    secondaryColor: '#334155',
    heatColor: '#e11d48',
    difficulty: 'Easy',
    stats: { power: 100, speed: 72, reach: 84, juggle: 78, defense: 100 },
    introQuote: "When I was a boy, I learned that power is the only truth.",
    winQuote: "This city is mine. It always was, and it always will be.",
    moves: [
      { id: 'kp_1', name: 'Bison Jab (1)', command: '1', damage: 16, type: 'high', hitStun: 16, blockAdvantage: 1, description: 'Heavy palm strike' },
      { id: 'kp_2', name: 'Diamond Cane Smash (2)', command: '2', damage: 26, type: 'mid', hitStun: 25, blockAdvantage: -2, description: 'Crushing mid cane chop' },
      { id: 'kp_3', name: 'Sumo Stamp (3)', command: '3', damage: 21, type: 'low', hitStun: 26, blockAdvantage: -13, description: 'Heavy stomping low foot shockwave' },
      { id: 'kp_4', name: 'Freight Train Launcher (4)', command: '4', damage: 32, type: 'mid', isLauncher: true, hitStun: 50, blockAdvantage: -15, description: 'Brutal upward headbutt launching foe airborne' },
      { id: 'kp_heat', name: 'Heat Burst: Syndicate Rage', command: '1+2', damage: 40, type: 'special', isHeatEngager: true, isArmor: true, hitStun: 36, blockAdvantage: 4, description: 'Unbreakable super armor burst with crimson Heat flames' },
      { id: 'kp_smash', name: 'Heat Smash: Manhattan Hammer', command: 'Heat 2+3', damage: 68, type: 'special', isWallSplat: true, hitStun: 56, blockAdvantage: 6, description: 'Two-handed hammerfist obliterating foe into the ground' },
      { id: 'kp_rage', name: 'Rage Art: Kingpin Execution', command: '3+4', damage: 95, type: 'rage', isArmor: true, hitStun: 85, blockAdvantage: -29, description: 'Pins target against car door, pummeling with raw fury' },
      { id: 'kp_throw', name: 'Bear Hug Crush', command: '1+3', damage: 45, type: 'throw', hitStun: 42, blockAdvantage: 0, description: 'Crushes opponent ribs in massive bearhug' },
    ],
  },
];

export const ARENA_STAGES: ArenaStage[] = [
  {
    id: 'stage_avengers_helipad',
    name: 'Avengers Tower Apex',
    subtitle: 'High Altitude Helipad - Floor 93',
    location: 'Midtown Manhattan Skyline',
    groundColor: '#1e293b',
    wallColor: '#0284c7',
    skyColor: '#0f172a',
    accentColor: '#38bdf8',
    musicTheme: 'electronic_heroic',
    hasWallBreak: true,
    hasFloorBreak: false,
  },
  {
    id: 'stage_oscorp_rooftop',
    name: 'Oscorp Bio-Reactor Core',
    subtitle: 'Genetics Lab Rooftop Facility',
    location: 'Upper Manhattan',
    groundColor: '#064e3b',
    wallColor: '#10b981',
    skyColor: '#022c22',
    accentColor: '#34d399',
    musicTheme: 'synth_dark',
    hasWallBreak: true,
    hasFloorBreak: true,
  },
  {
    id: 'stage_brooklyn_cage',
    name: 'Brooklyn Underground Cage',
    subtitle: 'Fisk Syndicate Fight Pit',
    location: 'Red Hook Docks',
    groundColor: '#451a03',
    wallColor: '#d97706',
    skyColor: '#1c1917',
    accentColor: '#f59e0b',
    musicTheme: 'heavy_metal_industrial',
    hasWallBreak: true,
    hasFloorBreak: false,
  },
  {
    id: 'stage_times_square_neon',
    name: 'Times Square Neon Arena',
    subtitle: 'LED Crossroads at Midnight',
    location: 'Broadway & 42nd St',
    groundColor: '#18181b',
    wallColor: '#ec4899',
    skyColor: '#09090b',
    accentColor: '#f43f5e',
    musicTheme: 'fast_edm_cyberpunk',
    hasWallBreak: true,
    hasFloorBreak: false,
  },
];

export interface PlayerFighterState {
  id: FighterId;
  health: number; // 0 - 100
  recoverableHealth: number; // 0 - 100 (grey health)
  heatGauge: number; // 0 - 100
  isHeatActive: boolean;
  isRageActive: boolean;
  isGuarding: boolean;
  isJuggled: boolean; // in airborne hitstun
  positionX: number; // -12 to 12
  positionZ: number; // lateral plane
  velocityY: number;
  heightY: number;
  currentAnimation: 'idle' | 'walk_fwd' | 'walk_back' | 'sidestep' | 'punch_1' | 'punch_2' | 'kick_3' | 'kick_4' | 'launcher' | 'heat_burst' | 'heat_smash' | 'rage_art' | 'throw' | 'hurt' | 'knockdown' | 'airborne' | 'block' | 'victory';
  animTimer: number;
  activeMove: MoveData | null;
  roundsWon: number;
}
