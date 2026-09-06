import { WeatherType, LiveWeatherReport, JJJBroadcastQuote } from '../components/3d/CityTypes';

export const JJJ_MOVIE_QUOTES: JJJBroadcastQuote[] = [
  {
    id: 'jjj_2002_menace',
    quote: "He's a menace to the entire city! A vigilante, a public menace, a criminal! I want that wall-crawling arachnid prosecuted, strung up by his own web! I WANT SPIDER-MAN!",
    movie: 'Spider-Man (2002)',
    context: 'Daily Bugle Editorial Office ranting to Robbie Robertson',
    intensity: 'raging',
  },
  {
    id: 'jjj_2002_infamous',
    quote: "He doesn't want to be famous? Then I'll make him infamous! Front page headline: 'SPIDER-MAN: THREAT OR MENACE?!' Print it!",
    movie: 'Spider-Man (2002)',
    context: 'Dictating the famous first front-page smear banner',
    intensity: 'editorial',
  },
  {
    id: 'jjj_2004_stole_suit',
    quote: "Spider-Man was a hero... I just couldn't see it. He was a... a thief! A criminal! He stole my suit! He's a menace to the entire city! I want Spider-Man!",
    movie: 'Spider-Man 2 (2004)',
    context: 'When Spider-Man steals his red-and-blue suit back off JJJ\'s wall',
    intensity: 'raging',
  },
  {
    id: 'jjj_2004_pay_advance',
    quote: "Could you pay me in advance? (Laughs hysterically) You serious?! Parker, you want a job? Get me pictures of Spider-Man! He's a menace!",
    movie: 'Spider-Man 2 (2004)',
    context: 'Laughing at Peter Parker asking for an advance',
    intensity: 'scandalous',
  },
  {
    id: 'jjj_2007_black_suit',
    quote: "Spider-Man in a black suit?! He's gone rogue! Call the police, send the SWAT team, call the National Guard! This masked psycho is tearing up Manhattan! Pack your bags, web-head, your freelance days are OVER!",
    movie: 'Spider-Man 3 (2007)',
    context: 'Reacting to Spider-Man\'s aggressive black symbiote sightings',
    intensity: 'raging',
  },
  {
    id: 'jjj_2019_mysterio',
    quote: "There you have it, folks! Conclusive proof that Spider-Man is a menace! Not a hero, a masked vigilante terrorizing our city! Public Enemy Number One!",
    movie: 'Spider-Man: Far From Home (2019)',
    context: 'Breaking news studio broadcast unmasking controversy',
    intensity: 'scandalous',
  },
  {
    id: 'jjj_2021_multiverse',
    quote: "That's right, New York! The web-headed menace has turned our beloved city into his personal disaster zone! While hard-working taxpayers build this town, this masked menace swings from our skyscrapers! Arrest him!",
    movie: 'Spider-Man: No Way Home (2021)',
    context: 'Live DailyBugle.net rooftop web studio broadcast',
    intensity: 'editorial',
  },
  {
    id: 'jjj_weather_storm',
    quote: "Look at this weather outside! Torrential rain, lightning, dark skies! And you know who's crawling in the gutters? SPIDER-MAN! He's probably using the storm to loot department stores! He's a MENACE!",
    movie: 'Daily Bugle Weather Desk',
    context: 'JJJ Live Severe Weather Doppler Special Report',
    intensity: 'raging',
  },
  {
    id: 'jjj_weather_snow',
    quote: "Freezing blizzard conditions in Manhattan! Hypothermia alert! And this reckless acrobat is swinging in thin red spandex! He's a menace to himself and a menace to city safety!",
    movie: 'Daily Bugle Winter Watch',
    context: 'Midtown Winter Storm Broadcast',
    intensity: 'editorial',
  },
  {
    id: 'jjj_weather_clear',
    quote: "Beautiful sunny day in Manhattan, and what do peaceful tourists get greeted by? A masked menace doing backflips off gargoyles! Miss Brant, get me my blood pressure pills!",
    movie: 'Daily Bugle Morning Bulletin',
    context: 'Manhattan Daylight Rush Hour Rant',
    intensity: 'scandalous',
  },
];

// Map timezones to representative coordinates for real-time weather
const TIMEZONE_COORDS: Record<string, { lat: number; lon: number; city: string }> = {
  'America/New_York': { lat: 40.7128, lon: -74.0060, city: 'New York City' },
  'America/Los_Angeles': { lat: 34.0522, lon: -118.2437, city: 'Los Angeles' },
  'America/Chicago': { lat: 41.8781, lon: -87.6298, city: 'Chicago' },
  'America/Denver': { lat: 39.7392, lon: -104.9903, city: 'Denver' },
  'Europe/London': { lat: 51.5074, lon: -0.1278, city: 'London' },
  'Europe/Paris': { lat: 48.8566, lon: 2.3522, city: 'Paris' },
  'Asia/Tokyo': { lat: 35.6762, lon: 139.6503, city: 'Tokyo' },
  'Asia/Singapore': { lat: 1.3521, lon: 103.8198, city: 'Singapore' },
  'Australia/Sydney': { lat: -33.8688, lon: 151.2093, city: 'Sydney' },
};

export function getUserLocalTimeInfo() {
  const now = new Date();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  
  const localTimeStr = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateStr = now.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const hours = now.getHours();
  let timeOfDay: 'dawn' | 'day' | 'golden_hour' | 'night' = 'day';
  if (hours >= 5 && hours < 8) timeOfDay = 'dawn';
  else if (hours >= 8 && hours < 17) timeOfDay = 'day';
  else if (hours >= 17 && hours < 20) timeOfDay = 'golden_hour';
  else timeOfDay = 'night';

  // Extract clean city name from timezone (e.g., 'America/New_York' -> 'New York')
  const cityParts = timezone.split('/');
  const rawCity = cityParts[cityParts.length - 1] || 'Manhattan';
  const city = rawCity.replace(/_/g, ' ');

  return { now, timezone, localTimeStr, dateStr, hours, timeOfDay, city };
}

// Fallback algorithm based on real-time month, date & time of user's player
export function getEstimatedRealtimeWeather(hours: number, month: number): {
  weather: WeatherType;
  tempF: number;
  tempC: number;
  condition: string;
} {
  // Winter months in northern hemisphere: Dec (11), Jan (0), Feb (1)
  const isWinter = month === 11 || month === 0 || month === 1;
  // Spring/Fall transition rain: Mar, Apr, May, Oct, Nov
  const isRainySeason = month === 3 || month === 4 || month === 9 || month === 10;

  let weather: WeatherType = 'clear';
  let tempF = 72;
  let condition = 'Sunny / Clear Skies';

  if (isWinter) {
    // 40% chance of snow or clear cold
    const r = (hours * 13 + month * 7) % 100;
    if (r < 45) {
      weather = 'snow';
      tempF = 28;
      condition = 'Winter Snow Flurry & Icy Gale';
    } else {
      weather = 'clear';
      tempF = 34;
      condition = 'Crisp Cold Winter Sunlight';
    }
  } else if (isRainySeason) {
    const r = (hours * 17 + month * 11) % 100;
    if (r < 50) {
      weather = 'rain';
      tempF = 58;
      condition = 'Coastal Downpour Rain Storm';
    } else {
      weather = 'clear';
      tempF = 66;
      condition = 'Scattered Clouds & Golden Horizon';
    }
  } else {
    // Summer / Warm season
    const r = (hours * 19 + month * 5) % 100;
    if (r < 25) {
      weather = 'rain';
      tempF = 75;
      condition = 'Summer Afternoon Thunderstorm';
    } else {
      weather = 'clear';
      tempF = 82;
      condition = 'Manhattan Blue Skies & Sunlight';
    }
  }

  const tempC = Math.round(((tempF - 32) * 5) / 9);
  return { weather, tempF, tempC, condition };
}

// Fetch live real-time weather from Open-Meteo API with resilient timeout
export async function fetchLiveRealtimeWeather(): Promise<LiveWeatherReport> {
  const timeInfo = getUserLocalTimeInfo();
  const coords = TIMEZONE_COORDS[timeInfo.timezone] || {
    lat: 40.7128,
    lon: -74.0060,
    city: timeInfo.city,
  };

  let weatherType: WeatherType = 'clear';
  let temperatureF = 72;
  let conditionDescription = 'Fair & Clear Skies';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const temp = data?.current?.temperature_2m;
      const code = data?.current?.weather_code ?? 0;

      if (typeof temp === 'number') {
        temperatureF = Math.round(temp);
      }

      // WMO Weather interpretation codes
      // 0: Clear sky, 1-3: Mainly clear/partly cloudy
      // 51,53,55: Drizzle, 61,63,65: Rain, 80-82: Rain showers, 95-99: Thunderstorm
      // 71,73,75: Snow fall, 85-86: Snow showers
      if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
        weatherType = 'snow';
        conditionDescription = 'Active Snowfall & Winter Blizzard';
      } else if (
        (code >= 51 && code <= 67) ||
        (code >= 80 && code <= 82) ||
        (code >= 95 && code <= 99)
      ) {
        weatherType = 'rain';
        conditionDescription = code >= 95 ? 'Severe Thunderstorm & Rain' : 'Active Rain Showers';
      } else {
        weatherType = 'clear';
        conditionDescription = data?.current?.is_day === 0 ? 'Clear Night Sky' : 'Clear Sunny Skies';
      }
    } else {
      throw new Error('API non-200');
    }
  } catch {
    // Fallback to estimated timezone / seasonal algorithm
    const est = getEstimatedRealtimeWeather(timeInfo.hours, timeInfo.now.getMonth());
    weatherType = est.weather;
    temperatureF = est.tempF;
    conditionDescription = est.condition;
  }

  const temperatureC = Math.round(((temperatureF - 32) * 5) / 9);

  // Match appropriate JJJ quote for current weather and situation
  let relevantQuotes = JJJ_MOVIE_QUOTES.filter((q) => {
    if (weatherType === 'rain' && q.id === 'jjj_weather_storm') return true;
    if (weatherType === 'snow' && q.id === 'jjj_weather_snow') return true;
    if (weatherType === 'clear' && q.id === 'jjj_weather_clear') return true;
    return q.movie.startsWith('Spider-Man');
  });

  if (relevantQuotes.length === 0) relevantQuotes = JJJ_MOVIE_QUOTES;
  const quote = relevantQuotes[Math.floor(Math.random() * relevantQuotes.length)] || JJJ_MOVIE_QUOTES[0];

  const headline =
    weatherType === 'rain'
      ? 'SPIDER-MAN CAUSES CHAOS IN DOWNTOWN RAINSTORM! MENACE UNLEASHED!'
      : weatherType === 'snow'
      ? 'BLIZZARD BANSHEE! SPIDER-MAN ACCUSED OF FREEZING MANHATTAN TRAFFIC!'
      : 'SPIDER-MAN: THREAT OR MENACE?! EXCLUSIVE BUGLE EDITORIAL!';

  return {
    timezone: timeInfo.timezone,
    city: coords.city || timeInfo.city,
    localTimeStr: timeInfo.localTimeStr,
    dateStr: timeInfo.dateStr,
    weatherType,
    temperatureF,
    temperatureC,
    conditionDescription,
    timeOfDay: timeInfo.timeOfDay,
    isAutoSynced: true,
    jjjReport: {
      headline,
      quote,
    },
  };
}

// Trigger browser Speech Synthesis for J. Jonah Jameson with energetic newsman cadence
export function playJJJSpeech(text: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.22; // Fast-talking 1950s/classic newspaper editor pace
    utterance.pitch = 0.88; // Deep, booming, gravelly voice
    utterance.volume = 1.0;

    // Pick an English voice (preferably male/en-US if available)
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Guy') || v.name.includes('Male'))) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}
