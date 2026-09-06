import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Radio,
  Volume2,
  VolumeX,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  Quote,
  Sparkles,
  CloudSun,
  Eye,
  EyeOff,
} from 'lucide-react';
import { LiveWeatherReport, WeatherType } from './CityTypes';
import {
  getUserLocalTimeInfo,
  fetchLiveRealtimeWeather,
  playJJJSpeech,
  JJJ_MOVIE_QUOTES,
} from '../../utils/realtimeWeather';

interface DailyBugleBroadcastProps {
  weather: WeatherType;
  onWeatherChange: (newWeather: WeatherType) => void;
  onSyncRealtimeWeather?: (report: LiveWeatherReport) => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export default function DailyBugleBroadcast({
  weather,
  onWeatherChange,
  onSyncRealtimeWeather,
  isVisible = true,
  onToggleVisibility,
}: DailyBugleBroadcastProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [internalVisible, setInternalVisible] = useState(true);
  const [report, setReport] = useState<LiveWeatherReport | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [liveClock, setLiveClock] = useState('');

  const activeVisible = onToggleVisibility ? isVisible : internalVisible;
  const toggleVisibility = onToggleVisibility || (() => setInternalVisible((v) => !v));

  // Use refs for callbacks to prevent unnecessary recreation of loadWeather and infinite loops
  const onWeatherChangeRef = useRef(onWeatherChange);
  onWeatherChangeRef.current = onWeatherChange;
  const onSyncRealtimeWeatherRef = useRef(onSyncRealtimeWeather);
  onSyncRealtimeWeatherRef.current = onSyncRealtimeWeather;

  // Initial load of real-time weather & user timezone
  const loadWeather = useCallback(async () => {
    setIsSyncing(true);
    try {
      const liveReport = await fetchLiveRealtimeWeather();
      setReport(liveReport);
      onWeatherChangeRef.current(liveReport.weatherType);
      if (onSyncRealtimeWeatherRef.current) {
        onSyncRealtimeWeatherRef.current(liveReport);
      }
    } catch {
      // Fallback handled inside fetchLiveRealtimeWeather
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  // Live ticking clock in user's timezone
  useEffect(() => {
    const updateTime = () => {
      const info = getUserLocalTimeInfo();
      setLiveClock(`${info.localTimeStr} (${info.city})`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Current active JJJ Quote
  const currentQuote = JJJ_MOVIE_QUOTES[quoteIndex] || JJJ_MOVIE_QUOTES[0];

  // Play JJJ Voice Rant
  const handlePlayVoice = () => {
    const speechText = `${currentQuote.quote} J. Jonah Jameson, Daily Bugle!`;
    const played = playJJJSpeech(speechText);
    if (played) {
      setIsVoiceActive(true);
      setTimeout(() => setIsVoiceActive(false), 8000);
    }
  };

  const handleStopVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceActive(false);
  };

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % JJJ_MOVIE_QUOTES.length);
  };

  if (!activeVisible) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 pointer-events-auto select-none">
        <button
          onClick={toggleVisibility}
          className="flex items-center gap-2 bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-yellow-100 font-sans font-black text-xs px-4 py-1.5 rounded-full border-2 border-yellow-400/80 shadow-[0_0_20px_rgba(220,38,38,0.6)] transition active:scale-95 animate-pulse"
          title="Show Live Daily Bugle Broadcast"
        >
          <Radio size={14} className="text-white" />
          <Eye size={13} className="text-yellow-300" />
          <span>SHOW LIVE BROADCAST</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl pointer-events-auto select-none transition-all duration-300">
      {/* Newspaper Top Bar / Ticker */}
      <div className="bg-neutral-950/95 border-2 border-red-600 rounded-2xl shadow-[0_10px_35px_rgba(220,38,38,0.35)] backdrop-blur-md overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 px-3 sm:px-4 py-1.5 flex items-center justify-between text-white border-b border-red-500">
          <div className="flex items-center gap-2">
            <span className="bg-black text-amber-300 text-[10px] font-mono uppercase px-2 py-0.5 rounded font-black tracking-widest flex items-center gap-1 shadow-inner">
              <Radio size={12} className="text-red-500 animate-pulse" /> LIVE BROADCAST
            </span>
            <h1 className="font-serif font-black tracking-wider text-xs sm:text-sm uppercase text-yellow-100 flex items-center gap-1.5">
              <span>THE DAILY BUGLE</span>
              <span className="hidden md:inline font-sans text-[11px] font-normal text-red-200">
                • J. JONAH JAMESON INVESTIGATIVE DESK
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Real-time Timezone & Clock */}
            <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-amber-200 bg-black/40 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              <Clock size={12} className="text-amber-400" />
              <span>{liveClock || 'Live Time'}</span>
            </div>

            {/* Sync Real-Time Weather */}
            <button
              onClick={loadWeather}
              disabled={isSyncing}
              className="flex items-center gap-1 bg-black/50 hover:bg-black/70 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-400/40 text-[11px] font-sans font-bold transition active:scale-95 disabled:opacity-50"
              title="Sync Auto-Weather to your real-time local date & time"
            >
              <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
              <span className="hidden md:inline">SYNC LOCAL WEATHER</span>
            </button>

            {/* Hide Live Broadcast Button */}
            <button
              onClick={toggleVisibility}
              className="flex items-center gap-1 bg-black/50 hover:bg-black/80 text-amber-300 hover:text-white px-2 py-0.5 rounded-lg border border-red-500/40 text-[11px] font-sans font-bold transition active:scale-95"
              title="Hide Live Broadcast bar"
            >
              <EyeOff size={12} className="text-red-400" />
              <span className="hidden sm:inline">HIDE LIVE BROADCAST</span>
            </button>

            {/* Expand / Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-black/40 rounded text-amber-200 transition"
              title={isExpanded ? 'Minimize Broadcast' : 'Expand JJJ Editorial Desk'}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Marquee Ticker & Menace Headline (Always visible) */}
        <div className="px-3 py-1.5 bg-neutral-900/90 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shrink-0 animate-pulse">
              ALERT
            </span>
            <div className="text-neutral-200 font-sans truncate text-[11px] sm:text-xs">
              <span className="font-extrabold text-amber-300 mr-2">
                &ldquo;SPIDER-MAN IS A MENACE!&rdquo;
              </span>
              <span className="text-neutral-400 italic mr-2 hidden sm:inline">
                ({currentQuote.movie}):
              </span>
              <span className="text-neutral-300">&ldquo;{currentQuote.quote}&rdquo;</span>
            </div>
          </div>

          {/* Quick Voice Broadcast Trigger */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isVoiceActive ? (
              <button
                onClick={handleStopVoice}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-[11px] font-bold shadow transition animate-pulse"
              >
                <VolumeX size={13} />
                <span className="hidden sm:inline">SILENCE JJJ</span>
              </button>
            ) : (
              <button
                onClick={handlePlayVoice}
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-2.5 py-1 rounded text-[11px] font-black shadow transition active:scale-95"
                title="Hear J. Jonah Jameson shout this quote!"
              >
                <Volume2 size={13} />
                <span>HEAR JJJ</span>
              </button>
            )}

            <button
              onClick={handleNextQuote}
              className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition"
              title="Next Spider-Man Movie Menace Quote"
            >
              <Quote size={13} />
            </button>
          </div>
        </div>

        {/* Expanded Editorial & Live Weather Radar Desk */}
        {isExpanded && (
          <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans animate-fadeIn">
            {/* Left: J. Jonah Jameson Animated Avatar & Desk */}
            <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-3 rounded-xl flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-red-500 overflow-hidden bg-neutral-800 shrink-0 flex items-center justify-center relative shadow-lg">
                {/* JJJ Cartoon Portrait Representation */}
                <div className="text-3xl select-none animate-bounce">📢</div>
                <div className="absolute bottom-0 right-0 bg-red-600 text-white text-[8px] font-black px-1 rounded">
                  JJJ
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-amber-300 text-sm tracking-wide">
                  J. JONAH JAMESON
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                  Publisher & Editor-in-Chief
                </span>
                <p className="text-[11px] text-red-400 font-bold mt-1">
                  &ldquo;He&apos;s a criminal! A public menace! Pack your bags, web-head!&rdquo;
                </p>
              </div>
            </div>

            {/* Middle: Active Movie Quote Card */}
            <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                    {currentQuote.movie}
                  </span>
                  <span className="bg-neutral-800 text-neutral-300 text-[9px] px-1.5 py-0.5 rounded font-mono">
                    {currentQuote.intensity.toUpperCase()}
                  </span>
                </div>
                <p className="text-neutral-200 italic leading-relaxed text-[11px]">
                  &ldquo;{currentQuote.quote}&rdquo;
                </p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800 text-[10px] text-neutral-400">
                <span>{currentQuote.context}</span>
                <button
                  onClick={handleNextQuote}
                  className="text-amber-400 hover:underline font-bold"
                >
                  Next Movie Quote →
                </button>
              </div>
            </div>

            {/* Right: Live Real-Time Weather Radar Report */}
            <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                  <span className="flex items-center gap-1 font-bold text-sky-400">
                    <CloudSun size={13} />
                    LIVE SATELLITE RADAR
                  </span>
                  <span className="text-neutral-300 font-mono">
                    {report ? `${report.temperatureF}°F / ${report.temperatureC}°C` : '72°F'}
                  </span>
                </div>

                <div className="text-neutral-200 font-medium text-xs mb-1">
                  {report?.conditionDescription || 'Manhattan Skyline Weather Synced'}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-neutral-400 text-[10px]">Active NYC Environment:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      weather === 'clear'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : weather === 'rain'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    }`}
                  >
                    {weather === 'clear' ? '☀️ Clear Skies' : weather === 'rain' ? '🌧️ Downpour Rain' : '❄️ Winter Snow'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-800">
                <button
                  onClick={() => onWeatherChange('clear')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition ${
                    weather === 'clear' ? 'bg-amber-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  Clear
                </button>
                <button
                  onClick={() => onWeatherChange('rain')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition ${
                    weather === 'rain' ? 'bg-sky-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  Rain
                </button>
                <button
                  onClick={() => onWeatherChange('snow')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition ${
                    weather === 'snow' ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  Snow
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
