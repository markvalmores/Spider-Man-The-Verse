export interface HolidayOccasion {
  id: string;
  month: number; // 1 - 12
  monthName: string;
  name: string;
  dateStr: string;
  description: string;
  bonusPizza: number;
  icon: string;
  themeColor: string;
  category: 'global' | 'cultural' | 'season' | 'civic';
  isHolidayMatch: (date: Date) => boolean;
}

// Utility functions for dynamic Mondays/Sundays/Thursdays
function isNthWeekdayOfMonth(date: Date, nth: number, weekday: number): boolean {
  // weekday: 0=Sunday, 1=Monday, ..., 4=Thursday
  if (date.getDay() !== weekday) return false;
  const dom = date.getDate();
  const weekNum = Math.ceil(dom / 7);
  return weekNum === nth;
}

function isLastWeekdayOfMonth(date: Date, weekday: number): boolean {
  if (date.getDay() !== weekday) return false;
  const nextWeek = new Date(date);
  nextWeek.setDate(date.getDate() + 7);
  return nextWeek.getMonth() !== date.getMonth();
}

export const HOLIDAY_OCCASIONS: HolidayOccasion[] = [
  // ================= JANUARY =================
  {
    id: 'jan_new_year',
    month: 1,
    monthName: 'January',
    name: "New Year's Day",
    dateStr: 'Jan 1',
    description: 'Ring in the New Year soaring above the glittering skyline of Manhattan!',
    bonusPizza: 500,
    icon: '🎆',
    themeColor: '#f59e0b',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 0 && d.getDate() === 1,
  },
  {
    id: 'jan_mlk_day',
    month: 1,
    monthName: 'January',
    name: 'Martin Luther King Jr. Day',
    dateStr: '3rd Monday of Jan',
    description: 'Honoring civil rights, justice, equality, and unity across communities.',
    bonusPizza: 450,
    icon: '🕊️',
    themeColor: '#60a5fa',
    category: 'civic',
    isHolidayMatch: (d) => d.getMonth() === 0 && isNthWeekdayOfMonth(d, 3, 1),
  },
  {
    id: 'jan_education',
    month: 1,
    monthName: 'January',
    name: 'International Day of Education',
    dateStr: 'Jan 24',
    description: 'Celebrating learning, science, and knowledge across Peter Parker’s laboratories.',
    bonusPizza: 350,
    icon: '📚',
    themeColor: '#34d399',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 0 && d.getDate() === 24,
  },

  // ================= FEBRUARY =================
  {
    id: 'feb_groundhog',
    month: 2,
    monthName: 'February',
    name: 'Groundhog Day',
    dateStr: 'Feb 2',
    description: 'Forecasting spring skies or six more weeks of rooftop winter swinging!',
    bonusPizza: 300,
    icon: '🦔',
    themeColor: '#fbbf24',
    category: 'cultural',
    isHolidayMatch: (d) => d.getMonth() === 1 && d.getDate() === 2,
  },
  {
    id: 'feb_world_radio',
    month: 2,
    monthName: 'February',
    name: 'World Radio Day',
    dateStr: 'Feb 13',
    description: 'Tuning into NYPD Police Scanners and J. Jonah Jameson Bugle Broadcasts.',
    bonusPizza: 350,
    icon: '📻',
    themeColor: '#a855f7',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 1 && d.getDate() === 13,
  },
  {
    id: 'feb_valentines',
    month: 2,
    monthName: 'February',
    name: "Valentine's Day",
    dateStr: 'Feb 14',
    description: 'Heartfelt rooftop sunsets with MJ and romantic bridges across NYC.',
    bonusPizza: 500,
    icon: '❤️',
    themeColor: '#f43f5e',
    category: 'cultural',
    isHolidayMatch: (d) => d.getMonth() === 1 && d.getDate() === 14,
  },
  {
    id: 'feb_presidents_day',
    month: 2,
    monthName: 'February',
    name: "Presidents' Day",
    dateStr: '3rd Monday of Feb',
    description: 'Federal holiday celebrating leadership and historic American heritage.',
    bonusPizza: 400,
    icon: '🏛️',
    themeColor: '#38bdf8',
    category: 'civic',
    isHolidayMatch: (d) => d.getMonth() === 1 && isNthWeekdayOfMonth(d, 3, 1),
  },

  // ================= MARCH =================
  {
    id: 'mar_wildlife',
    month: 3,
    monthName: 'March',
    name: 'World Wildlife Day',
    dateStr: 'Mar 3',
    description: 'Protecting Central Park fauna, urban hawks, and botanical gardens.',
    bonusPizza: 350,
    icon: '🦁',
    themeColor: '#10b981',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 2 && d.getDate() === 3,
  },
  {
    id: 'mar_womens_day',
    month: 3,
    monthName: 'March',
    name: "International Women's Day",
    dateStr: 'Mar 8',
    description: 'Honoring visionary women leaders, Mary Jane Watson, Aunt May, and Gwen Stacy.',
    bonusPizza: 500,
    icon: '🌸',
    themeColor: '#ec4899',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 2 && d.getDate() === 8,
  },
  {
    id: 'mar_happiness',
    month: 3,
    monthName: 'March',
    name: 'International Day of Happiness',
    dateStr: 'Mar 20',
    description: 'Spreading joy and high-fives with cheerful citizens all over Manhattan!',
    bonusPizza: 400,
    icon: '😊',
    themeColor: '#f59e0b',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 2 && d.getDate() === 20,
  },
  {
    id: 'mar_spring_equinox',
    month: 3,
    monthName: 'March',
    name: 'Spring Equinox',
    dateStr: 'Mar 20–22',
    description: 'Vernal equinox welcoming longer daylight, mild breezes, and blooming avenues.',
    bonusPizza: 450,
    icon: '🌱',
    themeColor: '#84cc16',
    category: 'season',
    isHolidayMatch: (d) => d.getMonth() === 2 && d.getDate() >= 20 && d.getDate() <= 22,
  },

  // ================= APRIL =================
  {
    id: 'apr_earth_day',
    month: 4,
    monthName: 'April',
    name: 'Earth Day',
    dateStr: 'Apr 22',
    description: 'Renewable clean city energy and environmental stewardship across rooftops.',
    bonusPizza: 500,
    icon: '🌍',
    themeColor: '#22c55e',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 3 && d.getDate() === 22,
  },
  {
    id: 'apr_world_book',
    month: 4,
    monthName: 'April',
    name: 'World Book Day',
    dateStr: 'Apr 23',
    description: 'Celebrating classic comic lore, literature, journalism, and storytelling.',
    bonusPizza: 350,
    icon: '📖',
    themeColor: '#8b5cf6',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 3 && d.getDate() === 23,
  },
  {
    id: 'apr_beltane_may_day',
    month: 4,
    monthName: 'April',
    name: 'Beltane / May Day',
    dateStr: 'Apr 30 – May 1',
    description: 'Ancient festival of fire, spring blossom vitality, and workers solidarity.',
    bonusPizza: 400,
    icon: '🔥',
    themeColor: '#f97316',
    category: 'cultural',
    isHolidayMatch: (d) =>
      (d.getMonth() === 3 && d.getDate() === 30) || (d.getMonth() === 4 && d.getDate() === 1),
  },

  // ================= MAY =================
  {
    id: 'may_cinco_de_mayo',
    month: 5,
    monthName: 'May',
    name: 'Cinco de Mayo',
    dateStr: 'May 5',
    description: 'Festive street music, vibrant cultural parades, and delicious Mexican feasts.',
    bonusPizza: 450,
    icon: '🪅',
    themeColor: '#ef4444',
    category: 'cultural',
    isHolidayMatch: (d) => d.getMonth() === 4 && d.getDate() === 5,
  },
  {
    id: 'may_mothers_day',
    month: 5,
    monthName: 'May',
    name: "Mother's Day",
    dateStr: '2nd Sunday of May',
    description: 'Celebrating wonderful mothers and Aunt May’s warmth and guidance.',
    bonusPizza: 500,
    icon: '💐',
    themeColor: '#f43f5e',
    category: 'cultural',
    isHolidayMatch: (d) => d.getMonth() === 4 && isNthWeekdayOfMonth(d, 2, 0),
  },
  {
    id: 'may_families_day',
    month: 5,
    monthName: 'May',
    name: 'International Day of Families',
    dateStr: 'May 15',
    description: 'Cherishing bonds of family, mentorship, and community solidarity.',
    bonusPizza: 350,
    icon: '👨‍👩‍👦',
    themeColor: '#38bdf8',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 4 && d.getDate() === 15,
  },
  {
    id: 'may_memorial_day',
    month: 5,
    monthName: 'May',
    name: 'Memorial Day',
    dateStr: 'Last Monday of May',
    description: 'Honoring brave servicemen and women who sacrificed for freedom.',
    bonusPizza: 500,
    icon: '🎖️',
    themeColor: '#3b82f6',
    category: 'civic',
    isHolidayMatch: (d) => d.getMonth() === 4 && isLastWeekdayOfMonth(d, 1),
  },

  // ================= JUNE =================
  {
    id: 'jun_juneteenth',
    month: 6,
    monthName: 'June',
    name: 'Juneteenth',
    dateStr: 'June 19',
    description: 'National Independence Day celebrating emancipation, resilience, and equality.',
    bonusPizza: 500,
    icon: '⛓️‍💥',
    themeColor: '#eab308',
    category: 'civic',
    isHolidayMatch: (d) => d.getMonth() === 5 && d.getDate() === 19,
  },
  {
    id: 'jun_fathers_day',
    month: 6,
    monthName: 'June',
    name: "Father's Day",
    dateStr: '3rd Sunday of June',
    description: 'Remembering Uncle Ben’s eternal lesson: With great power comes great responsibility.',
    bonusPizza: 500,
    icon: '👔',
    themeColor: '#0ea5e9',
    category: 'cultural',
    isHolidayMatch: (d) => d.getMonth() === 5 && isNthWeekdayOfMonth(d, 3, 0),
  },
  {
    id: 'jun_summer_solstice',
    month: 6,
    monthName: 'June',
    name: 'Summer Solstice',
    dateStr: 'June 21',
    description: 'Longest day of the year with radiant sun beaming across Manhattan skyscrapers.',
    bonusPizza: 450,
    icon: '☀️',
    themeColor: '#f59e0b',
    category: 'season',
    isHolidayMatch: (d) => d.getMonth() === 5 && d.getDate() === 21,
  },

  // ================= JULY =================
  {
    id: 'jul_independence_day',
    month: 7,
    monthName: 'July',
    name: 'Independence Day',
    dateStr: 'July 4',
    description: 'Spectacular 4th of July fireworks erupting over the East River bridges!',
    bonusPizza: 600,
    icon: '🎆',
    themeColor: '#ef4444',
    category: 'civic',
    isHolidayMatch: (d) => d.getMonth() === 6 && d.getDate() === 4,
  },
  {
    id: 'jul_mandela_day',
    month: 7,
    monthName: 'July',
    name: 'Nelson Mandela International Day',
    dateStr: 'July 18',
    description: 'Dedicated to 67 minutes of public service, justice, and human dignity.',
    bonusPizza: 450,
    icon: '🌟',
    themeColor: '#10b981',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 6 && d.getDate() === 18,
  },

  // ================= AUGUST =================
  {
    id: 'aug_lammas',
    month: 8,
    monthName: 'August',
    name: 'Lammas / Lughnasadh',
    dateStr: 'Aug 1–2',
    description: 'First harvest festival celebrating golden wheat, bread making, and fresh pizza dough!',
    bonusPizza: 400,
    icon: '🌾',
    themeColor: '#d97706',
    category: 'cultural',
    isHolidayMatch: (d) => d.getMonth() === 7 && (d.getDate() === 1 || d.getDate() === 2),
  },
  {
    id: 'aug_youth_day',
    month: 8,
    monthName: 'August',
    name: 'International Youth Day',
    dateStr: 'Aug 12',
    description: 'Empowering the next generation of young heroes and innovators like Miles Morales.',
    bonusPizza: 450,
    icon: '⚡',
    themeColor: '#06b6d4',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 7 && d.getDate() === 12,
  },

  // ================= SEPTEMBER =================
  {
    id: 'sep_labor_day',
    month: 9,
    monthName: 'September',
    name: 'Labor Day',
    dateStr: '1st Monday of Sept',
    description: 'Saluting hard-working New Yorkers, delivery riders, builders, and emergency crews.',
    bonusPizza: 500,
    icon: '🛠️',
    themeColor: '#f97316',
    category: 'civic',
    isHolidayMatch: (d) => d.getMonth() === 8 && isNthWeekdayOfMonth(d, 1, 1),
  },
  {
    id: 'sep_peace_day',
    month: 9,
    monthName: 'September',
    name: 'International Day of Peace',
    dateStr: 'Sept 21',
    description: 'Strengthening peace, harmony, and non-violence across every city district.',
    bonusPizza: 450,
    icon: '🕊️',
    themeColor: '#38bdf8',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 8 && d.getDate() === 21,
  },
  {
    id: 'sep_autumn_equinox',
    month: 9,
    monthName: 'September',
    name: 'Autumnal Equinox',
    dateStr: 'Sept 22',
    description: 'Crisp autumn breezes sweeping through Central Park with amber foliage.',
    bonusPizza: 450,
    icon: '🍂',
    themeColor: '#ea580c',
    category: 'season',
    isHolidayMatch: (d) => d.getMonth() === 8 && d.getDate() === 22,
  },

  // ================= OCTOBER =================
  {
    id: 'oct_indigenous_peoples_day',
    month: 10,
    monthName: 'October',
    name: "Indigenous Peoples' Day / Columbus Day",
    dateStr: '2nd Monday of Oct',
    description: 'Honoring Indigenous cultures, ancestral lands, histories, and traditions.',
    bonusPizza: 450,
    icon: '🏹',
    themeColor: '#059669',
    category: 'civic',
    isHolidayMatch: (d) => d.getMonth() === 9 && isNthWeekdayOfMonth(d, 2, 1),
  },
  {
    id: 'oct_halloween',
    month: 10,
    monthName: 'October',
    name: 'Halloween / Samhain',
    dateStr: 'Oct 31',
    description: 'Spooky Manhattan night with costumed rooftop prowlers and jack-o’-lanterns!',
    bonusPizza: 600,
    icon: '🎃',
    themeColor: '#f97316',
    category: 'cultural',
    isHolidayMatch: (d) => d.getMonth() === 9 && d.getDate() === 31,
  },

  // ================= NOVEMBER =================
  {
    id: 'nov_veterans_day',
    month: 11,
    monthName: 'November',
    name: 'Veterans Day',
    dateStr: 'Nov 11',
    description: 'Tribute to all military veterans for their valor, service, and dedication.',
    bonusPizza: 500,
    icon: '🎖️',
    themeColor: '#2563eb',
    category: 'civic',
    isHolidayMatch: (d) => d.getMonth() === 10 && d.getDate() === 11,
  },
  {
    id: 'nov_thanksgiving',
    month: 11,
    monthName: 'November',
    name: 'Thanksgiving',
    dateStr: '4th Thursday of Nov',
    description: 'Gratitude, community feasts, and giant parade balloons floating over 6th Avenue!',
    bonusPizza: 650,
    icon: '🦃',
    themeColor: '#d97706',
    category: 'cultural',
    isHolidayMatch: (d) => d.getMonth() === 10 && isNthWeekdayOfMonth(d, 4, 4),
  },

  // ================= DECEMBER =================
  {
    id: 'dec_human_rights',
    month: 12,
    monthName: 'December',
    name: 'Human Rights Day',
    dateStr: 'Dec 10',
    description: 'Universal Declaration of Human Rights defending liberty and equality for all.',
    bonusPizza: 450,
    icon: '⚖️',
    themeColor: '#3b82f6',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 11 && d.getDate() === 10,
  },
  {
    id: 'dec_winter_solstice',
    month: 12,
    monthName: 'December',
    name: 'Winter Solstice',
    dateStr: 'Dec 21',
    description: 'Longest winter night blanketed in snow flurries over Midtown skyscrapers.',
    bonusPizza: 450,
    icon: '❄️',
    themeColor: '#a5b4fc',
    category: 'season',
    isHolidayMatch: (d) => d.getMonth() === 11 && d.getDate() === 21,
  },
  {
    id: 'dec_christmas',
    month: 12,
    monthName: 'December',
    name: 'Christmas Day',
    dateStr: 'Dec 25',
    description: 'Rockefeller Center Christmas tree lights, warm pizzas, and holiday peace.',
    bonusPizza: 700,
    icon: '🎄',
    themeColor: '#16a34a',
    category: 'cultural',
    isHolidayMatch: (d) => d.getMonth() === 11 && d.getDate() === 25,
  },
  {
    id: 'dec_new_years_eve',
    month: 12,
    monthName: 'December',
    name: "New Year's Eve",
    dateStr: 'Dec 31',
    description: 'Midnight Times Square crystal ball drop countdown with confetti storm!',
    bonusPizza: 750,
    icon: '🥂',
    themeColor: '#eab308',
    category: 'global',
    isHolidayMatch: (d) => d.getMonth() === 11 && d.getDate() === 31,
  },
];

// Helper to find currently active holiday occasion for today's date
export function getCurrentHolidayOccasions(testDate: Date = new Date()): HolidayOccasion[] {
  return HOLIDAY_OCCASIONS.filter((occ) => occ.isHolidayMatch(testDate));
}

// Local storage key for claimed holiday bonuses
const STORAGE_KEY = 'spidey_claimed_holiday_bonuses_v1';

export function getClaimedHolidayBonusIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveClaimedHolidayBonusId(id: string): string[] {
  try {
    const list = getClaimedHolidayBonusIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
    return list;
  } catch {
    return [];
  }
}
