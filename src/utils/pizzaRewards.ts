export interface RewardInfo {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayOfWeek: string;
  isWeekend: boolean;
  baseAmount: number; // 50 (weekday) or 100 (weekend)
  occasionName: string | null;
  occasionType: 'easter_resurrection' | 'holy_week' | 'all_saints' | 'celebration' | 'season' | 'standard';
  totalReward: number; // 34000, 2337, 777, 100, or 50
  description: string;
  badgeColor: string;
}

export interface CountryCelebration {
  id: string;
  name: string;
  flag: string;
}

export const SUPPORTED_COUNTRIES: CountryCelebration[] = [
  { id: 'global', name: 'Worldwide / Universal', flag: '🌍' },
  { id: 'ph', name: 'Philippines', flag: '🇵🇭' },
  { id: 'us', name: 'United States', flag: '🇺🇸' },
  { id: 'mx', name: 'Mexico', flag: '🇲🇽' },
  { id: 'es', name: 'Spain', flag: '🇪🇸' },
  { id: 'it', name: 'Italy', flag: '🇮🇹' },
  { id: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'br', name: 'Brazil', flag: '🇧🇷' },
  { id: 'jp', name: 'Japan', flag: '🇯🇵' },
  { id: 'de', name: 'Germany', flag: '🇩🇪' },
  { id: 'ca', name: 'Canada', flag: '🇨🇦' },
];

/**
 * Computes Western Easter Sunday using Meeus/Jones/Butcher algorithm
 */
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Checks if two dates share the same year, month, and day
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Formats a date into a standard YYYY-MM-DD key
 */
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate the exact pizza reward for any given date and country/celebration context
 */
export function calculatePizzaReward(targetDate: Date = new Date(), countryId: string = 'global'): RewardInfo {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1; // 1-12
  const day = targetDate.getDate();
  const dayOfWeekIndex = targetDate.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;
  const baseAmount = isWeekend ? 100 : 50;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dayNames[dayOfWeekIndex];
  const dateKey = formatDateKey(targetDate);

  // 1. Check Easter Sunday (The Resurrection of Jesus Christ - End of Holy Week)
  const easterSunday = getEasterSunday(year);
  if (isSameDay(targetDate, easterSunday)) {
    return {
      date: targetDate,
      dateKey,
      dayOfWeek,
      isWeekend,
      baseAmount,
      occasionName: 'Easter Sunday — Resurrection of Jesus Christ (End of Holy Week)',
      occasionType: 'easter_resurrection',
      totalReward: 34000,
      description: 'He is Risen! The grand conclusion of Holy Week bestows the ultimate celebration bounty.',
      badgeColor: 'from-amber-400 via-yellow-300 to-yellow-500 text-neutral-950 font-black shadow-[0_0_20px_#f59e0b]',
    };
  }

  // 2. Check Holy Week Days (Palm Sunday up to Holy Saturday - 7 days leading to Easter)
  const easterTime = easterSunday.getTime();
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDaysFromEaster = Math.round((targetDate.getTime() - easterTime) / msPerDay);

  if (diffDaysFromEaster >= -7 && diffDaysFromEaster < 0) {
    const holyDays: Record<number, string> = {
      [-7]: 'Palm Sunday (Start of Holy Week)',
      [-6]: 'Holy Monday',
      [-5]: 'Holy Tuesday',
      [-4]: 'Holy Wednesday (Spy Wednesday)',
      [-3]: 'Maundy Thursday (The Last Supper)',
      [-2]: 'Good Friday (Crucifixion)',
      [-1]: 'Holy Saturday (Black Saturday)',
    };
    const holyName = holyDays[diffDaysFromEaster] || 'Holy Week Observance';

    return {
      date: targetDate,
      dateKey,
      dayOfWeek,
      isWeekend,
      baseAmount,
      occasionName: `Holy Week: ${holyName}`,
      occasionType: 'holy_week',
      totalReward: 2337,
      description: 'Special Holy Week sanctity blessing bestowed across all sacred days leading to Easter.',
      badgeColor: 'from-purple-600 to-indigo-600 text-white font-bold shadow-[0_0_15px_#9333ea]',
    };
  }

  // 3. Check All Saints\' Day (November 1)
  if (month === 11 && day === 1) {
    return {
      date: targetDate,
      dateKey,
      dayOfWeek,
      isWeekend,
      baseAmount,
      occasionName: "All Saints' Day (Solemnity of All Saints)",
      occasionType: 'all_saints',
      totalReward: 2337,
      description: 'Sacred commemoration of all saints and holy martyrs with a sacred 2,337 pizza endowment.',
      badgeColor: 'from-amber-500 to-red-600 text-white font-bold shadow-[0_0_15px_#ea580c]',
    };
  }

  // 4. Check Special Occasions, Seasons, Traditions, Feasts (777 Pizzas)
  let foundOccasion: string | null = null;
  let occasionDetail = 'Special festival and feast tradition bonus active.';

  // Fixed global celebrations
  if (month === 1 && day === 1) {
    foundOccasion = "New Year's Day (Global Celebration)";
    occasionDetail = 'Ring in the New Year with a festive bounty!';
  } else if (month === 1 && day === 6) {
    foundOccasion = 'Epiphany / Feast of the Three Kings';
    occasionDetail = 'Celebration of the Magi and Twelfth Night of Christmas.';
  } else if (month === 1 && day === 9) {
    foundOccasion = 'Feast of the Black Nazarene';
    occasionDetail = 'Massive holy procession and feast tradition in Manila.';
  } else if (month === 1 && day >= 15 && day <= 21 && dayOfWeekIndex === 0) {
    foundOccasion = 'Feast of Santo Niño (Sinulog / Ati-Atihan Festival)';
    occasionDetail = 'Dynamic street dance feast and cultural festival.';
  } else if (month === 2 && day === 14) {
    foundOccasion = "Valentine's Day (Season of Love)";
    occasionDetail = 'Heartfelt celebration of affection and companionship!';
  } else if (month === 3 && day === 17) {
    foundOccasion = "St. Patrick's Day (Feast of St. Patrick)";
    occasionDetail = 'Green festivity and cultural heritage celebration.';
  } else if (month === 3 && day >= 19 && day <= 22) {
    foundOccasion = 'Spring Equinox (First Day of Spring Festival)';
    occasionDetail = 'The awakening of nature and blossoms across the globe.';
  } else if (month === 4 && day === 22) {
    foundOccasion = 'Earth Day (Global Environmental Feast)';
    occasionDetail = 'Honoring mother Earth and green traditions.';
  } else if (month === 5 && day === 5) {
    foundOccasion = 'Cinco de Mayo Festival';
    occasionDetail = 'Celebration of Mexican courage, heritage, and music.';
  } else if (month === 5 && day >= 8 && day <= 14 && dayOfWeekIndex === 0) {
    foundOccasion = "Mother's Day";
    occasionDetail = 'Honoring maternal love and traditions worldwide.';
  } else if (month === 6 && day >= 15 && day <= 21 && dayOfWeekIndex === 0) {
    foundOccasion = "Father's Day";
    occasionDetail = 'Honoring paternal strength and guidance.';
  } else if (month === 6 && day >= 20 && day <= 22) {
    foundOccasion = 'Summer Solstice (First Day of Summer Festival)';
    occasionDetail = 'Longest day of sunshine, beach season, and vibrant festivities!';
  } else if (month === 8 && day === 15) {
    foundOccasion = 'Feast of the Assumption of Mary (Ferragosto)';
    occasionDetail = 'Universal mid-summer holy feast and national holiday.';
  } else if (month === 9 && day >= 21 && day <= 23) {
    foundOccasion = 'Autumn Equinox (Harvest & Fall Season)';
    occasionDetail = 'Crisp breezes, harvest moons, and cozy traditions.';
  } else if (month === 10 && day === 31) {
    foundOccasion = 'Halloween / All Hallows\' Eve';
    occasionDetail = 'Costumes, jack-o\'-lanterns, and spooky heroic thrills!';
  } else if (month === 11 && day === 2) {
    foundOccasion = "All Souls' Day / Día de los Muertos";
    occasionDetail = 'Honoring ancestors, departed souls, and family traditions.';
  } else if (month === 11 && day >= 22 && day <= 28 && dayOfWeekIndex === 4) {
    foundOccasion = 'Thanksgiving Day';
    occasionDetail = 'Feast of gratitude, roast turkey, and family bonding.';
  } else if (month === 12 && day === 8) {
    foundOccasion = 'Feast of the Immaculate Conception';
    occasionDetail = 'Major Catholic holy day of obligation and celebration.';
  } else if (month === 12 && day >= 16 && day <= 24) {
    foundOccasion = 'Christmas Novena / Simbang Gabi / Las Posadas';
    occasionDetail = 'Nine-day countdown of dawn masses and festive lantern traditions.';
  } else if (month === 12 && (day === 21 || day === 22)) {
    foundOccasion = 'Winter Solstice (First Day of Winter)';
    occasionDetail = 'Embracing the chill, snow, and cozy fireside season.';
  } else if (month === 12 && day === 24) {
    foundOccasion = 'Christmas Eve (Nochebuena)';
    occasionDetail = 'Family midnight feasts, gift exchanges, and excitement!';
  } else if (month === 12 && day === 25) {
    foundOccasion = 'Christmas Day (Feast of the Nativity)';
    occasionDetail = 'Joy to the world! Merry Christmas celebration.';
  } else if (month === 12 && day === 26) {
    foundOccasion = 'Boxing Day / Feast of St. Stephen';
    occasionDetail = 'Post-Christmas gifting and fellowship tradition.';
  } else if (month === 12 && day === 31) {
    foundOccasion = "New Year's Eve (Midnight Countdown)";
    occasionDetail = 'Spectacular fireworks, resolutions, and joyful midnight countdown!';
  }

  // Country-specific dates
  if (!foundOccasion) {
    if (countryId === 'ph') {
      if (month === 6 && day === 12) foundOccasion = 'Philippine Independence Day (Araw ng Kalayaan)';
      else if (month === 8 && day >= 25 && day <= 31 && dayOfWeekIndex === 1) foundOccasion = 'National Heroes Day (Pambansang Araw ng mga Bayani)';
      else if (month === 11 && day === 30) foundOccasion = 'Bonifacio Day';
      else if (month === 12 && day === 30) foundOccasion = 'Rizal Day';
    } else if (countryId === 'us') {
      if (month === 7 && day === 4) foundOccasion = 'US Independence Day (4th of July)';
      else if (month === 1 && day >= 15 && day <= 21 && dayOfWeekIndex === 1) foundOccasion = 'Martin Luther King Jr. Day';
      else if (month === 5 && day >= 25 && dayOfWeekIndex === 1) foundOccasion = 'Memorial Day';
      else if (month === 9 && day <= 7 && dayOfWeekIndex === 1) foundOccasion = 'Labor Day';
    } else if (countryId === 'mx') {
      if (month === 9 && day === 16) foundOccasion = 'Mexican Independence Day (Grito de Dolores)';
      else if (month === 11 && day === 20) foundOccasion = 'Día de la Revolución';
      else if (month === 12 && day === 12) foundOccasion = 'Feast of Our Lady of Guadalupe';
    } else if (countryId === 'es') {
      if (month === 10 && day === 12) foundOccasion = 'Fiesta Nacional de España';
      else if (month === 12 && day === 6) foundOccasion = 'Día de la Constitución Española';
    } else if (countryId === 'it') {
      if (month === 4 && day === 25) foundOccasion = 'Festa della Liberazione';
      else if (month === 6 && day === 2) foundOccasion = 'Festa della Repubblica';
    } else if (countryId === 'gb') {
      if (month === 11 && day === 5) foundOccasion = 'Guy Fawkes Night (Bonfire Night)';
      else if (month === 4 && day === 23) foundOccasion = "St. George's Day";
    } else if (countryId === 'jp') {
      if (month === 5 && day === 5) foundOccasion = 'Children\'s Day (Kodomo no Hi)';
      else if (month === 7 && day === 7) foundOccasion = 'Tanabata Star Festival';
    }
  }

  // Broad Seasons check (Winter, Spring, Summer, Fall)
  // If user requested: "777 every occasion like winter spring summer christmas valentine new year etc you know it depends on the countriies celebration and events and occasions and feast and traditions"
  if (foundOccasion) {
    return {
      date: targetDate,
      dateKey,
      dayOfWeek,
      isWeekend,
      baseAmount,
      occasionName: foundOccasion,
      occasionType: 'celebration',
      totalReward: 777,
      description: occasionDetail,
      badgeColor: 'from-red-600 to-amber-600 text-white font-bold shadow-[0_0_15px_#dc2626]',
    };
  }

  // 5. Standard Weekday (50 🍕) or Weekend (100 🍕)
  if (isWeekend) {
    return {
      date: targetDate,
      dateKey,
      dayOfWeek,
      isWeekend: true,
      baseAmount: 100,
      occasionName: `${dayOfWeek} Weekend Bonus`,
      occasionType: 'standard',
      totalReward: 100,
      description: 'Weekend patrol bonus awarded every Saturday and Sunday.',
      badgeColor: 'from-blue-600 to-sky-500 text-white font-bold',
    };
  }

  return {
    date: targetDate,
    dateKey,
    dayOfWeek,
    isWeekend: false,
    baseAmount: 50,
    occasionName: `${dayOfWeek} Weekday Patrol`,
    occasionType: 'standard',
    totalReward: 50,
    description: 'Daily patrol ration awarded every Monday through Friday.',
    badgeColor: 'from-neutral-700 to-neutral-800 text-neutral-200 font-medium',
  };
}

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  PIZZA_TOTAL: 'spiderman_pizza_total',
  LAST_CLAIM_DATE: 'spiderman_pizza_last_claim_date',
  AUTO_CLAIM_LOG: 'spiderman_pizza_auto_claim_log',
  COUNTRY_SETTING: 'spiderman_pizza_country',
};

/**
 * Check if today has already been claimed
 */
export function isTodayClaimed(targetDate: Date = new Date()): boolean {
  try {
    const todayKey = formatDateKey(targetDate);
    const lastClaimedKey = localStorage.getItem(STORAGE_KEYS.LAST_CLAIM_DATE);
    return lastClaimedKey === todayKey;
  } catch {
    return false;
  }
}

/**
 * Mark a specific date as claimed
 */
export function markDayClaimed(targetDate: Date = new Date()): void {
  try {
    const key = formatDateKey(targetDate);
    localStorage.setItem(STORAGE_KEYS.LAST_CLAIM_DATE, key);
  } catch {
    // Ignore in non-storage envs
  }
}

/**
 * Calculate seconds until next midnight
 */
export function getSecondsUntilMidnight(now: Date = new Date()): number {
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = nextMidnight.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
}

/**
 * Format remaining seconds into HH:MM:SS
 */
export function formatTimeUntilMidnight(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
