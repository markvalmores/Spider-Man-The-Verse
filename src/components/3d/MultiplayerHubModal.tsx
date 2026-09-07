import React, { useState } from 'react';
import { Users, Wifi, MessageSquare, Send, Zap, Compass, MapPin } from 'lucide-react';

export interface CoopPlayerInfo {
  id: string;
  name: string;
  suitName: string;
  district: string;
  level: number;
  pingMs: number;
  avatar: string;
  pos: [number, number, number];
}

interface MultiplayerHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  multiplayerEnabled: boolean;
  onToggleMultiplayer: () => void;
  onSendCoopPing: (message: string) => void;
  onTeleportToPlayer?: (pos: [number, number, number]) => void;
}

const ACTIVE_COOP_SQUAD: CoopPlayerInfo[] = [
  {
    id: 'miles',
    name: 'Miles_Morales_Brooklyn',
    suitName: 'Spider-Man 3 Symbiote Black',
    district: 'Financial District / Wall St',
    level: 42,
    pingMs: 24,
    avatar: '⚡',
    pos: [85, 45, 50],
  },
  {
    id: 'gwen',
    name: 'GhostSpider_Gwen',
    suitName: 'Homecoming Stark Tech',
    district: 'Chelsea / High Line',
    level: 38,
    pingMs: 31,
    avatar: '🌸',
    pos: [-100, 65, -80],
  },
  {
    id: 'tobey',
    name: 'Raimi_Peter_NYC',
    suitName: 'Spider-Man 2 Classic',
    district: 'Times Square Central Plaza',
    level: 50,
    pingMs: 18,
    avatar: '🕷️',
    pos: [120, 80, 90],
  },
  {
    id: 'andrew',
    name: 'Amazing_Spidey_Queens',
    suitName: 'TASM 2 High-Gloss',
    district: 'Queensboro Bridge East River',
    level: 45,
    pingMs: 27,
    avatar: '🕸️',
    pos: [-80, 55, 100],
  },
];

const QUICK_PINGS = [
  '🕷️ Web-Heads Assemble!',
  '🚨 Need Backup at Oscorp Tower!',
  '🏃 High-Altitude Race to Avengers Spire!',
  '🍕 Pizza slice break on Daily Bugle roof!',
  '🤝 Great swing, partner!',
  '🛡️ Protecting civilians on Broadway!',
];

export function MultiplayerHubModal({
  isOpen,
  onClose,
  multiplayerEnabled,
  onToggleMultiplayer,
  onSendCoopPing,
  onTeleportToPlayer,
}: MultiplayerHubModalProps) {
  const [customMsg, setCustomMsg] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = (msg: string) => {
    if (!msg.trim()) return;
    onSendCoopPing(msg);
    setSentNotice(`Sent: "${msg}"`);
    setCustomMsg('');
    setTimeout(() => setSentNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-neutral-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-950 border border-emerald-500/60 rounded-xl text-emerald-400">
              <Users size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-wide text-white font-['Bangers']">
                  SPIDER-MAN MULTIPLAYER CO-OP PATROL
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 rounded text-xs font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {multiplayerEnabled ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Real-time Manhattan Spider-Hero synchronization & quick dispatch chat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Multiplayer Live Toggle Switch */}
          <div className="flex items-center justify-between p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Wifi size={16} className={multiplayerEnabled ? 'text-emerald-400' : 'text-neutral-500'} />
                <span>Multiplayer Spider-Patrol Engine</span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Renders other Spider-Heroes swinging around Manhattan skyscrapers with active trails & name tags.
              </p>
            </div>
            <button
              onClick={onToggleMultiplayer}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition font-mono ${
                multiplayerEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
              }`}
            >
              {multiplayerEnabled ? 'MULTIPLAYER: ON' : 'MULTIPLAYER: OFF'}
            </button>
          </div>

          {/* 2. Connected Spider-Heroes Roster */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                ACTIVE HEROES IN MANHATTAN (4 ONLINE)
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">
                🟢 Low Latency Server: NYC-East-1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACTIVE_COOP_SQUAD.map((hero) => (
                <div
                  key={hero.id}
                  className="p-3.5 bg-neutral-950/60 border border-neutral-800 hover:border-emerald-500/50 rounded-xl transition flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{hero.avatar}</span>
                      <div>
                        <div className="text-sm font-bold text-white font-mono">{hero.name}</div>
                        <div className="text-[11px] text-neutral-400">{hero.suitName}</div>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded text-[10px] font-bold">
                      Lv.{hero.level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/80">
                    <div className="flex items-center gap-1 text-sky-400">
                      <MapPin size={12} />
                      <span>{hero.district}</span>
                    </div>

                    {onTeleportToPlayer && (
                      <button
                        onClick={() => {
                          onTeleportToPlayer(hero.pos);
                          onClose();
                        }}
                        className="px-2 py-0.5 bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-600/60 rounded text-[10px] font-bold transition"
                      >
                        Swing To 🚀
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Co-Op Quick Chat & Radio Emote Dispatch */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={16} className="text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                CO-OP SPIDER-RADIO QUICK CHAT & PINGS
              </span>
            </div>

            {sentNotice && (
              <div className="mb-2 p-2 bg-emerald-950/80 border border-emerald-500/80 rounded-lg text-emerald-300 text-xs font-mono font-bold animate-pulse">
                {sentNotice}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {QUICK_PINGS.map((ping, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(ping)}
                  className="p-2.5 text-left bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/60 rounded-xl text-xs text-neutral-200 hover:text-white transition active:scale-95"
                >
                  {ping}
                </button>
              ))}
            </div>

            {/* Custom message input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(customMsg)}
                placeholder="Broadcast message to all swinging Spider-Heroes..."
                className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-red-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
              <button
                onClick={() => handleSend(customMsg)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition"
              >
                <Send size={14} />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800 bg-neutral-950/80 text-xs text-neutral-400">
          <span>🟢 Connected to Manhattan Spider-Network</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
