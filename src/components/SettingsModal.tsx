import React, { useState, useRef } from 'react';
import { GameSettings, CustomKeybindings, DEFAULT_KEYBINDINGS } from '../types';
import { DeviceInfo, ControllerInfo, ControllerBrand } from '../utils/deviceDetector';
import { exportSpideySaveData, importSpideySaveData } from '../utils/saveDataManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  deviceInfo: DeviceInfo;
  gamepadState: ControllerInfo;
  onLoadSaveData?: (importedData: any) => void;
  currentSaveState?: any;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  deviceInfo,
  gamepadState,
  onLoadSaveData,
  currentSaveState,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'device' | 'controls' | 'multiplayer_vr' | 'savedata'>('device');
  const [editingAction, setEditingAction] = useState<keyof CustomKeybindings | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleKeybindCapture = (action: keyof CustomKeybindings, e: React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newKeybindings = {
      ...settings.keybindings,
      [action]: e.code,
    };
    onUpdateSettings({
      ...settings,
      keybindings: newKeybindings,
    });
    setEditingAction(null);
  };

  const handleResetKeybindings = () => {
    onUpdateSettings({
      ...settings,
      keybindings: { ...DEFAULT_KEYBINDINGS },
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('Loading .spidey save file...');
      const imported = await importSpideySaveData(file);
      setImportStatus('✅ Save data loaded successfully!');
      if (onLoadSaveData) {
        onLoadSaveData(imported);
      }
      setTimeout(() => setImportStatus(null), 3500);
    } catch (err: any) {
      setImportStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-neutral-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white">System Settings & Controls</h2>
              <p className="text-xs text-neutral-400">Universal Device, Controller, Co-Op & .spidey Save Manager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('device')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
              activeTab === 'device'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            📱 Device & Gamepad
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
              activeTab === 'controls'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🎮 Controls & Remap
          </button>
          <button
            onClick={() => setActiveTab('multiplayer_vr')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
              activeTab === 'multiplayer_vr'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🌐 Co-Op & Meta Quest VR
          </button>
          <button
            onClick={() => setActiveTab('savedata')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
              activeTab === 'savedata'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            💾 .spidey Save Data
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: DEVICE & GAMEPAD */}
          {activeTab === 'device' && (
            <div className="space-y-5">
              {/* Device Detection Card */}
              <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Detected System</span>
                  <span className="px-2 py-0.5 bg-blue-950/80 border border-blue-600/60 rounded text-blue-300 text-xs font-mono font-bold">
                    {deviceInfo.type.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-neutral-500">Device Type:</span>{' '}
                    <span className="font-semibold text-white">{deviceInfo.label}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Operating System:</span>{' '}
                    <span className="font-semibold text-white">{deviceInfo.os}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Browser / Kernel:</span>{' '}
                    <span className="font-semibold text-white">{deviceInfo.browser}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Screen Resolution:</span>{' '}
                    <span className="font-semibold text-white">{deviceInfo.screenResolution}</span>
                  </div>
                </div>
              </div>

              {/* Gamepad Connection Card */}
              <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Universal Controller Detector</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                    gamepadState.connected
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  }`}>
                    {gamepadState.connected ? '🟢 CONTROLLER CONNECTED' : '⚪ NO CONTROLLER (TOUCH/KEYBOARD ACTIVE)'}
                  </span>
                </div>

                {gamepadState.connected ? (
                  <div className="space-y-2 text-sm">
                    <p className="text-emerald-400 font-bold">{gamepadState.brandLabel}</p>
                    <p className="text-xs font-mono text-neutral-400">Hardware ID: {gamepadState.id}</p>
                    <div className="flex gap-4 text-xs text-neutral-300 mt-2">
                      <span>Buttons: {gamepadState.buttonCount}</span>
                      <span>Analog Sticks: {gamepadState.axesCount / 2}</span>
                      <span>Haptic Vibration: {gamepadState.hasVibration ? 'Supported' : 'Standard'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">
                    Connect any PlayStation (DualSense/DualShock), Xbox, Nintendo Switch, or Generic USB controller via Bluetooth or USB to automatically switch to controller glyphs.
                  </p>
                )}
              </div>

              {/* On-Screen Touch Layout Style Selection */}
              <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Virtual Touch & Button Glyph Layout
                </span>
                <p className="text-xs text-neutral-400">
                  Choose your preferred symbol layout for on-screen touch buttons and controller prompts:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(['playstation', 'xbox', 'numeric'] as const).map((layout) => (
                    <button
                      key={layout}
                      onClick={() => onUpdateSettings({ ...settings, touchLayout: layout })}
                      className={`p-3 rounded-xl border text-center transition ${
                        settings.touchLayout === layout
                          ? 'border-red-500 bg-red-950/40 text-white font-bold'
                          : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="text-base font-bold capitalize">{layout}</div>
                      <div className="text-xs mt-1 text-neutral-300">
                        {layout === 'playstation' && '✕ ◯ ▢ △'}
                        {layout === 'xbox' && 'A B X Y'}
                        {layout === 'numeric' && '1 2 3 4'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTROLS & KEY REMAPPER */}
          {activeTab === 'controls' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Custom Input & Key Rebinding</h3>
                  <p className="text-xs text-neutral-400">Click any key to rebind to your preferred keyboard or controller button.</p>
                </div>
                <button
                  onClick={handleResetKeybindings}
                  className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-lg border border-neutral-700 transition"
                >
                  ↺ Reset Defaults
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    { key: 'forward', label: 'Move Forward', defaultKey: 'W' },
                    { key: 'backward', label: 'Move Backward', defaultKey: 'S' },
                    { key: 'left', label: 'Turn Left', defaultKey: 'A' },
                    { key: 'right', label: 'Turn Right', defaultKey: 'D' },
                    { key: 'jump', label: 'Vault / Jump / Wall Leap', defaultKey: 'Space' },
                    { key: 'swing', label: 'Web Swing / Hold to Glide', defaultKey: 'Left Shift' },
                    { key: 'sprint', label: 'Sprint / Wall-Run Surge', defaultKey: 'E' },
                    { key: 'zip', label: 'Web Zip to Point', defaultKey: 'F' },
                    { key: 'attack', label: 'Attack / Web Strike', defaultKey: 'Q' },
                    { key: 'slam', label: 'Ground Slam', defaultKey: 'C' },
                    { key: 'stick', label: 'Wall Stick / 4-Point Crawl', defaultKey: 'X' },
                    { key: 'acrobat', label: 'Acrobatics / Somersaults', defaultKey: 'Z' },
                    { key: 'camera', label: 'Toggle Camera View (FP/TP/VR)', defaultKey: 'V' },
                    { key: 'photo', label: 'Daily Bugle Photo Mode', defaultKey: 'P' },
                  ] as { key: keyof CustomKeybindings; label: string; defaultKey: string }[]
                ).map(({ key, label }) => {
                  const isEditing = editingAction === key;
                  const currentBinding = settings.keybindings[key] || DEFAULT_KEYBINDINGS[key];

                  return (
                    <div
                      key={key}
                      className={`p-3 bg-neutral-950/60 border rounded-xl flex items-center justify-between ${
                        isEditing ? 'border-amber-500 bg-amber-950/20' : 'border-neutral-800'
                      }`}
                    >
                      <div className="text-xs">
                        <div className="font-semibold text-white">{label}</div>
                      </div>
                      {isEditing ? (
                        <input
                          autoFocus
                          type="text"
                          readOnly
                          value="Press any key..."
                          onKeyDown={(e) => handleKeybindCapture(key, e)}
                          onBlur={() => setEditingAction(null)}
                          className="px-3 py-1 bg-amber-900/80 border border-amber-500 text-amber-200 text-xs font-mono font-bold rounded-lg text-center cursor-pointer outline-none"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingAction(key)}
                          className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-mono font-bold rounded-lg transition"
                        >
                          {currentBinding.replace('Key', '')}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MULTIPLAYER CO-OP & META QUEST VR */}
          {activeTab === 'multiplayer_vr' && (
            <div className="space-y-5">
              {/* Multiplayer Co-Op Toggle */}
              <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌐</span>
                    <span className="font-bold text-white">Online Co-Op Patrol</span>
                    <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-600 rounded text-emerald-400 text-[10px] font-bold font-mono">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Display real-time online Spider-Men swinging through New York with active green status beacons.
                  </p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ ...settings, multiplayerEnabled: !settings.multiplayerEnabled })}
                  className={`w-14 h-7 rounded-full p-1 transition ${
                    settings.multiplayerEnabled ? 'bg-emerald-600' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition transform ${
                      settings.multiplayerEnabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Meta Quest VR Mode & First-Person Toggle */}
              <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥽</span>
                    <span className="font-bold text-white">Meta Quest VR & First-Person Mode</span>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-950/80 border border-purple-600 rounded text-purple-300 text-xs font-mono font-bold">
                    QUEST 1/2/3/PRO
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Enable high-FOV stereoscopic first-person camera mode inside Meta Quest Browser or standard web browsers with responsive head tilt and swinging dynamics.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, firstPersonCamera: !settings.firstPersonCamera })}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      settings.firstPersonCamera
                        ? 'border-purple-500 bg-purple-950/40 text-white font-bold'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold">First-Person Camera</div>
                      <div className="text-xs text-neutral-400">Eye-level immersion</div>
                    </div>
                    <span className="text-xs font-mono font-bold">{settings.firstPersonCamera ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ ...settings, vrModeEnabled: !settings.vrModeEnabled })}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      settings.vrModeEnabled
                        ? 'border-purple-500 bg-purple-950/40 text-white font-bold'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold">Quest VR Ultra-Wide FOV</div>
                      <div className="text-xs text-neutral-400">110° Stereoscopic FOV</div>
                    </div>
                    <span className="text-xs font-mono font-bold">{settings.vrModeEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: .SPIDEY SAVE DATA & AUTO-SAVE */}
          {activeTab === 'savedata' && (
            <div className="space-y-5">
              {/* Auto Save Toggle */}
              <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💾</span>
                    <span className="font-bold text-white">Auto-Save Game State</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Automatically persist your pizza bankroll, unlocked movie suits, skill tree progress, and photo gallery.
                  </p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ ...settings, autoSaveEnabled: !settings.autoSaveEnabled })}
                  className={`w-14 h-7 rounded-full p-1 transition ${
                    settings.autoSaveEnabled ? 'bg-red-600' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition transform ${
                      settings.autoSaveEnabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Export & Import Buttons */}
              <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Backup & Restore (.spidey Files)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Export */}
                  <button
                    onClick={() => exportSpideySaveData(currentSaveState || {})}
                    className="p-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 rounded-xl text-white font-bold flex flex-col items-center justify-center gap-1 shadow-lg transition active:scale-98"
                  >
                    <span className="text-xl">📤</span>
                    <span>Export Save File (.spidey)</span>
                    <span className="text-[10px] font-normal text-red-200">Download complete game state backup</span>
                  </button>

                  {/* Import */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-xl text-white font-bold flex flex-col items-center justify-center gap-1 shadow-lg transition active:scale-98"
                  >
                    <span className="text-xl">📥</span>
                    <span>Load Save File (.spidey)</span>
                    <span className="text-[10px] font-normal text-neutral-400">Restore from .spidey save file</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".spidey,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {importStatus && (
                  <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-semibold text-center text-amber-300">
                    {importStatus}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-800 bg-neutral-950/80">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
