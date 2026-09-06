import { GameSettings, SpideySaveData, DEFAULT_KEYBINDINGS, AVAILABLE_CHARACTERS } from '../types';

export const SETTINGS_STORAGE_KEY = 'spiderman_game_settings';
export const SAVE_DATA_STORAGE_KEY = 'spiderman_save_data';

export const DEFAULT_SETTINGS: GameSettings = {
  multiplayerEnabled: true,
  vrModeEnabled: false,
  firstPersonCamera: false,
  autoSaveEnabled: true,
  touchLayout: 'playstation',
  keybindings: { ...DEFAULT_KEYBINDINGS },
  masterVolume: 1.0,
  hapticFeedback: true,
};

// 1. Get saved settings from localStorage
export function loadGameSettings(): GameSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        keybindings: {
          ...DEFAULT_KEYBINDINGS,
          ...(parsed.keybindings || {}),
        },
      };
    }
  } catch {
    // Fallback to default
  }
  return { ...DEFAULT_SETTINGS };
}

// 2. Save settings to localStorage
export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings:', err);
  }
}

// 3. Export Save Data as .spidey file
export function exportSpideySaveData(data: Partial<SpideySaveData>): void {
  const fullSaveData: SpideySaveData = {
    formatVersion: 'spidey_v1.0',
    timestamp: new Date().toISOString(),
    userEmail: data.userEmail || 'hero@dailybugle.nyc',
    pizza: data.pizza ?? 500,
    selectedCharacterId: data.selectedCharacterId || 'spiderman-1',
    unlockedCharacterIds: data.unlockedCharacterIds || AVAILABLE_CHARACTERS.map(c => c.id),
    skills: data.skills || [],
    settings: data.settings || loadGameSettings(),
    stats: {
      totalSwings: data.stats?.totalSwings ?? 142,
      distanceTraveledMeters: data.stats?.distanceTraveledMeters ?? 18450,
      photosTaken: data.stats?.photosTaken ?? 8,
      enemiesDefeated: data.stats?.enemiesDefeated ?? 24,
      highestSpeedMph: data.stats?.highestSpeedMph ?? 118,
      wallRunsCompleted: data.stats?.wallRunsCompleted ?? 57,
    },
  };

  const jsonString = JSON.stringify(fullSaveData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeDate = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `SpiderMan_NYC_Save_${safeDate}.spidey`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 4. Import / Parse .spidey File
export async function importSpideySaveData(file: File): Promise<SpideySaveData> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.spidey') && !file.name.endsWith('.json')) {
      reject(new Error('Invalid file format. Please select a valid .spidey save file.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as SpideySaveData;
        if (!parsed.formatVersion || !parsed.formatVersion.startsWith('spidey_')) {
          reject(new Error('Corrupted or unsupported .spidey save file signature.'));
          return;
        }
        resolve(parsed);
      } catch (err) {
        reject(new Error('Failed to parse .spidey file: Invalid JSON syntax.'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading .spidey file.'));
    reader.readAsText(file);
  });
}
