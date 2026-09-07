import * as THREE from 'three';
import { Character } from '../types';

export interface SpiderSuitTextureData {
  id: string;
  name: string;
  category: 'raimi' | 'tasm' | 'mcu' | 'multiverse' | 'villain' | 'symbiote';
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  webHex: string;
  eyeHex: string;
  eyeFrameHex: string;
  roughness: number;
  metalness: number;
  bumpScale: number;
  emissive?: string;
  emissiveIntensity?: number;
  patternType: 'raimi_silver_3d' | 'classic_web' | 'symbiote_tendrils' | 'tasm_honeycomb' | 'stark_nano_tech' | 'neon_synthwave' | 'venom_organic' | 'goblin_armor' | 'dock_ock_metal' | 'sand_particles';
}

// Procedural Canvas-based procedural texture generator for Spider-Man suits
class ProceduralTextureCache {
  private cache: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Generates a multi-layered procedural diffuse + bump/normal texture map
   */
  getLayeredTexture(
    pattern: string,
    primaryColor: string,
    secondaryColor: string,
    webColor: string,
    accentColor: string
  ): THREE.CanvasTexture {
    const key = `${pattern}_${primaryColor}_${secondaryColor}_${webColor}_${accentColor}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Base Layer: Solid color with subtle fabric gradient
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, primaryColor);
      grad.addColorStop(0.5, secondaryColor);
      grad.addColorStop(1, primaryColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // 2. Micro-Weave Fabric Detail Layer (Fabric Noise / Mesh dots)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let y = 0; y < 512; y += 4) {
        for (let x = (y % 8 === 0 ? 0 : 2); x < 512; x += 4) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let y = 2; y < 512; y += 4) {
        for (let x = (y % 8 === 0 ? 2 : 0); x < 512; x += 4) {
          ctx.fillRect(x, y, 2, 2);
        }
      }

      // 3. Pattern Specific Layering
      if (pattern === 'raimi_silver_3d' || pattern === 'classic_web') {
        // Multi-layered concentric webbing grid with 3D shadow + silver highlights
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)'; // Web shadow
        ctx.lineWidth = 4;
        this.drawWebNet(ctx, 256, 256, 240);

        ctx.strokeStyle = webColor; // 3D Silver web core
        ctx.lineWidth = 2.5;
        this.drawWebNet(ctx, 256, 256, 240);

        // Highlight shine on top of webbing
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        this.drawWebNet(ctx, 254, 254, 240);
      } else if (pattern === 'tasm_honeycomb') {
        // High-tech hexagonal honeycomb mesh
        ctx.strokeStyle = webColor;
        ctx.lineWidth = 1.5;
        this.drawHexGrid(ctx, 20);
      } else if (pattern === 'symbiote_tendrils' || pattern === 'venom_organic') {
        // Organic branching symbiote liquid tendrils
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 3;
        this.drawTendrilWeb(ctx);
      } else if (pattern === 'stark_nano_tech') {
        // High-tech circuit / nano geometric segments
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        this.drawNanoCircuits(ctx);
      } else if (pattern === 'neon_synthwave') {
        // 2099 / Miles neon energy glow lines
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3;
        this.drawEnergyGrid(ctx);
      } else if (pattern === 'goblin_armor') {
        // Metallic layered armor plates
        this.drawArmorPlates(ctx, primaryColor, accentColor);
      } else {
        // Default standard web lattice
        ctx.strokeStyle = webColor;
        ctx.lineWidth = 2;
        this.drawWebNet(ctx, 256, 256, 240);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    this.cache.set(key, texture);
    return texture;
  }

  private drawWebNet(ctx: CanvasRenderingContext2D, cx: number, cy: number, maxRadius: number) {
    // Radiating spines
    const spokes = 12;
    for (let i = 0; i < spokes; i++) {
      const angle = (i * Math.PI * 2) / spokes;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
      ctx.stroke();
    }

    // Concentric scallops
    const rings = 8;
    for (let r = 1; r <= rings; r++) {
      const rad = (r / rings) * maxRadius;
      ctx.beginPath();
      for (let i = 0; i <= spokes; i++) {
        const angle = (i * Math.PI * 2) / spokes;
        const x = cx + Math.cos(angle) * rad;
        const y = cy + Math.sin(angle) * rad;
        if (i === 0) ctx.moveTo(x, y);
        else {
          const prevAngle = ((i - 1) * Math.PI * 2) / spokes;
          const midAngle = (prevAngle + angle) / 2;
          const sag = rad * 0.88;
          const qx = cx + Math.cos(midAngle) * sag;
          const qy = cy + Math.sin(midAngle) * sag;
          ctx.quadraticCurveTo(qx, qy, x, y);
        }
      }
      ctx.stroke();
    }
  }

  private drawHexGrid(ctx: CanvasRenderingContext2D, size: number) {
    const h = size * Math.sqrt(3);
    for (let y = 0; y < 512 + h; y += h) {
      for (let x = 0; x < 512 + size * 3; x += size * 3) {
        this.drawHexagon(ctx, x, y, size);
        this.drawHexagon(ctx, x + size * 1.5, y + h / 2, size);
      }
    }
  }

  private drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = x + r * Math.cos(angle);
      const hy = y + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
  }

  private drawTendrilWeb(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      let sx = Math.random() * 512;
      let sy = Math.random() * 512;
      ctx.moveTo(sx, sy);
      for (let j = 0; j < 6; j++) {
        sx += (Math.random() - 0.5) * 120;
        sy += (Math.random() - 0.5) * 120;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
  }

  private drawNanoCircuits(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < 20; i++) {
      const sx = (i % 5) * 100 + 20;
      const sy = Math.floor(i / 5) * 120 + 20;
      ctx.strokeRect(sx, sy, 70, 70);
      ctx.beginPath();
      ctx.moveTo(sx + 35, sy);
      ctx.lineTo(sx + 35, sy + 70);
      ctx.moveTo(sx, sy + 35);
      ctx.lineTo(sx + 70, sy + 35);
      ctx.stroke();
    }
  }

  private drawEnergyGrid(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    for (let i = 0; i < 512; i += 32) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
    }
    ctx.stroke();
  }

  private drawArmorPlates(ctx: CanvasRenderingContext2D, prim: string, acc: string) {
    ctx.fillStyle = acc;
    for (let y = 30; y < 512; y += 90) {
      for (let x = 30; x < 512; x += 90) {
        ctx.fillRect(x, y, 70, 70);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, 70, 70);
      }
    }
  }
}

export const textureCache = new ProceduralTextureCache();

/**
 * High-definition Spider-Man API & Roster Texture Registry
 */
export const SPIDER_MAN_SUIT_API: Record<string, SpiderSuitTextureData> = {
  'spiderman-1': {
    id: 'spiderman-1',
    name: 'Spider-Man (2002 Raimi)',
    category: 'raimi',
    primaryHex: '#b91c1c',
    secondaryHex: '#1e3a8a',
    accentHex: '#0f172a',
    webHex: '#e2e8f0',
    eyeHex: '#ffffff',
    eyeFrameHex: '#94a3b8',
    roughness: 0.32,
    metalness: 0.28,
    bumpScale: 0.05,
    patternType: 'raimi_silver_3d',
  },
  'spiderman-2': {
    id: 'spiderman-2',
    name: 'Spider-Man 2 (2004 Scarlet & Blue)',
    category: 'raimi',
    primaryHex: '#dc2626',
    secondaryHex: '#1d4ed8',
    accentHex: '#0f172a',
    webHex: '#f1f5f9',
    eyeHex: '#f8fafc',
    eyeFrameHex: '#cbd5e1',
    roughness: 0.28,
    metalness: 0.32,
    bumpScale: 0.06,
    patternType: 'raimi_silver_3d',
  },
  'spiderman-3-black': {
    id: 'spiderman-3-black',
    name: 'Spider-Man 3 (Symbiote)',
    category: 'symbiote',
    primaryHex: '#09090b',
    secondaryHex: '#18181b',
    accentHex: '#ffffff',
    webHex: '#71717a',
    eyeHex: '#ffffff',
    eyeFrameHex: '#52525b',
    roughness: 0.18,
    metalness: 0.55,
    bumpScale: 0.08,
    patternType: 'symbiote_tendrils',
  },
  'tasm-1': {
    id: 'tasm-1',
    name: 'The Amazing Spider-Man 1',
    category: 'tasm',
    primaryHex: '#991b1b',
    secondaryHex: '#0f172a',
    accentHex: '#fbbf24',
    webHex: '#334155',
    eyeHex: '#fbbf24', // Yellow tint sunglass optics
    eyeFrameHex: '#020617',
    roughness: 0.42,
    metalness: 0.18,
    bumpScale: 0.04,
    patternType: 'tasm_honeycomb',
  },
  'tasm-2': {
    id: 'tasm-2',
    name: 'The Amazing Spider-Man 2',
    category: 'tasm',
    primaryHex: '#dc2626',
    secondaryHex: '#2563eb',
    accentHex: '#ffffff',
    webHex: '#1e293b',
    eyeHex: '#ffffff',
    eyeFrameHex: '#0f172a',
    roughness: 0.3,
    metalness: 0.2,
    bumpScale: 0.05,
    patternType: 'classic_web',
  },
  'mcu-iron-spider': {
    id: 'mcu-iron-spider',
    name: 'Iron Spider (Nano-Tech)',
    category: 'mcu',
    primaryHex: '#991b1b',
    secondaryHex: '#1e3a8a',
    accentHex: '#fbbf24', // Gold web trim
    webHex: '#f59e0b',
    eyeHex: '#38bdf8',
    eyeFrameHex: '#fbbf24',
    roughness: 0.15,
    metalness: 0.75,
    bumpScale: 0.06,
    emissive: '#0284c7',
    emissiveIntensity: 0.4,
    patternType: 'stark_nano_tech',
  },
  'miles-morales': {
    id: 'miles-morales',
    name: 'Miles Morales (Venom Blast)',
    category: 'multiverse',
    primaryHex: '#0f172a',
    secondaryHex: '#dc2626',
    accentHex: '#eab308',
    webHex: '#ef4444',
    eyeHex: '#ffffff',
    eyeFrameHex: '#dc2626',
    roughness: 0.25,
    metalness: 0.35,
    bumpScale: 0.05,
    emissive: '#eab308',
    emissiveIntensity: 0.3,
    patternType: 'neon_synthwave',
  },
  'spiderman-2099': {
    id: 'spiderman-2099',
    name: 'Spider-Man 2099 (Miguel O\'Hara)',
    category: 'multiverse',
    primaryHex: '#1e1b4b',
    secondaryHex: '#dc2626',
    accentHex: '#ef4444',
    webHex: '#f43f5e',
    eyeHex: '#ef4444',
    eyeFrameHex: '#881337',
    roughness: 0.2,
    metalness: 0.6,
    bumpScale: 0.06,
    emissive: '#ef4444',
    emissiveIntensity: 0.5,
    patternType: 'neon_synthwave',
  },
  'spider-punk': {
    id: 'spider-punk',
    name: 'Spider-Punk (Hobie Brown)',
    category: 'multiverse',
    primaryHex: '#0369a1',
    secondaryHex: '#dc2626',
    accentHex: '#facc15',
    webHex: '#ffffff',
    eyeHex: '#ffffff',
    eyeFrameHex: '#000000',
    roughness: 0.5,
    metalness: 0.3,
    bumpScale: 0.05,
    patternType: 'classic_web',
  },
  'venom': {
    id: 'venom',
    name: 'Venom (Symbiote)',
    category: 'symbiote',
    primaryHex: '#020617',
    secondaryHex: '#09090b',
    accentHex: '#ffffff',
    webHex: '#a855f7',
    eyeHex: '#ffffff',
    eyeFrameHex: '#18181b',
    roughness: 0.12,
    metalness: 0.65,
    bumpScale: 0.1,
    emissive: '#7e22ce',
    emissiveIntensity: 0.2,
    patternType: 'venom_organic',
  },
  'green_goblin': {
    id: 'green_goblin',
    name: 'Green Goblin (Oscorp Armor)',
    category: 'villain',
    primaryHex: '#15803d',
    secondaryHex: '#7e22ce',
    accentHex: '#84cc16',
    webHex: '#a855f7',
    eyeHex: '#facc15',
    eyeFrameHex: '#14532d',
    roughness: 0.3,
    metalness: 0.6,
    bumpScale: 0.08,
    patternType: 'goblin_armor',
  },
  'doc_ock': {
    id: 'doc_ock',
    name: 'Doctor Octopus (Otto Octavius)',
    category: 'villain',
    primaryHex: '#047857',
    secondaryHex: '#d97706',
    accentHex: '#06b6d4',
    webHex: '#cbd5e1',
    eyeHex: '#06b6d4',
    eyeFrameHex: '#0f172a',
    roughness: 0.35,
    metalness: 0.5,
    bumpScale: 0.06,
    patternType: 'dock_ock_metal',
  },
};

/**
 * Resolves full multi-layered suit texture specifications for any fighter or character ID
 */
export function getSpiderSuitConfig(suitIdOrArchetypeId: string): SpiderSuitTextureData {
  if (SPIDER_MAN_SUIT_API[suitIdOrArchetypeId]) {
    return SPIDER_MAN_SUIT_API[suitIdOrArchetypeId];
  }

  // Alias maps
  if (suitIdOrArchetypeId === 'peter_parker' || suitIdOrArchetypeId === 's1') {
    return SPIDER_MAN_SUIT_API['spiderman-2'];
  }
  if (suitIdOrArchetypeId === 'symbiote_spidey') {
    return SPIDER_MAN_SUIT_API['spiderman-3-black'];
  }
  if (suitIdOrArchetypeId === 'miles') {
    return SPIDER_MAN_SUIT_API['miles-morales'];
  }
  if (suitIdOrArchetypeId === 'punk') {
    return SPIDER_MAN_SUIT_API['spider-punk'];
  }
  if (suitIdOrArchetypeId === 'spidey_2099') {
    return SPIDER_MAN_SUIT_API['spiderman-2099'];
  }

  // Fallback to classic Spider-Man Raimi config
  return SPIDER_MAN_SUIT_API['spiderman-2'];
}
