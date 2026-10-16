import * as THREE from 'three';

export const BIOME_PALETTES = {
  volcanic: {
    ocean: '#3a0904',
    land: '#8b1e0f',
    landDetail: '#d94b18',
    glow: '#ff5500',
    clouds: 'rgba(70, 30, 20, 0.45)',
    cityLights: '#ffcc00',
    roughness: 0.85,
    metalness: 0.1,
  },
  oceanic: {
    ocean: '#03254c',
    land: '#11698e',
    landDetail: '#16c79a',
    glow: '#38bdf8',
    clouds: 'rgba(255, 255, 255, 0.7)',
    cityLights: '#ffe6aa',
    roughness: 0.35,
    metalness: 0.25,
  },
  desert: {
    ocean: '#946b2d',
    land: '#cca43b',
    landDetail: '#e0c068',
    glow: '#facc15',
    clouds: 'rgba(230, 210, 180, 0.35)',
    cityLights: '#67e8f9',
    roughness: 0.9,
    metalness: 0.05,
  },
  frozen: {
    ocean: '#112233',
    land: '#6290c8',
    landDetail: '#cce6f4',
    glow: '#bae6fd',
    clouds: 'rgba(240, 248, 255, 0.65)',
    cityLights: '#38bdf8',
    roughness: 0.4,
    metalness: 0.3,
  },
  tundra: {
    ocean: '#1a2e3b',
    land: '#3e5c59',
    landDetail: '#7da2a9',
    glow: '#7dd3fc',
    clouds: 'rgba(230, 240, 250, 0.5)',
    cityLights: '#fde047',
    roughness: 0.7,
    metalness: 0.15,
  },
  temperate: {
    ocean: '#0a3055',
    land: '#1f6f43',
    landDetail: '#3fa34d',
    glow: '#34d399',
    clouds: 'rgba(255, 255, 255, 0.72)',
    cityLights: '#fde047',
    roughness: 0.55,
    metalness: 0.15,
  },
  toxic: {
    ocean: '#2e0854',
    land: '#6b21a8',
    landDetail: '#a855f7',
    glow: '#c084fc',
    clouds: 'rgba(180, 100, 240, 0.55)',
    cityLights: '#4ade80',
    roughness: 0.75,
    metalness: 0.2,
  },
  exotic: {
    ocean: '#4a044e',
    land: '#9d174d',
    landDetail: '#f43f5e',
    glow: '#f472b6',
    clouds: 'rgba(250, 180, 230, 0.5)',
    cityLights: '#38bdf8',
    roughness: 0.6,
    metalness: 0.2,
  },
  barren: {
    ocean: '#262626',
    land: '#525252',
    landDetail: '#737373',
    glow: '#94a3b8',
    clouds: 'rgba(120, 120, 120, 0.2)',
    cityLights: '#38bdf8',
    roughness: 0.95,
    metalness: 0.05,
  },
};

const MAX_CACHED_TEXTURES = 40;
const textureCache = new Map();
const normalTextureCache = new Map();
const cloudTextureCache = new Map();

function setBoundedTexture(cache, key, texture) {
  if (cache.size >= MAX_CACHED_TEXTURES && !cache.has(key)) {
    const oldestKey = cache.keys().next().value;
    const oldTex = cache.get(oldestKey);
    cache.delete(oldestKey);
    if (oldTex && typeof oldTex.dispose === 'function') {
      try { oldTex.dispose(); } catch (_) {}
    }
  }
  cache.set(key, texture);
}

/**
 * Genera textura procedural de superficie con armónicos fractales y luces nocturnas.
 */
export function createPlanetTexture(palette, biome = 'temperate', seed = 1, population = 0, buildingLevels = 0, debrisAmount = 0) {
  const isVirgin = population <= 0 && buildingLevels <= 0;
  const civTier = isVirgin ? 0 : Math.min(5, Math.floor(Math.log10(Math.max(10, population)) + buildingLevels / 10));
  const hasDebrisFlag = debrisAmount > 0 ? 1 : 0;
  const cacheKey = `planet_${biome}_${seed}_${civTier}_${hasDebrisFlag}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  const canvas = document.createElement('canvas');
  const w = 256;
  const h = 128;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  const hexToRgb = (hex) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  const oceanDeep = hexToRgb(palette.ocean);
  const oceanShallow = biome === 'temperate' ? [24, 98, 140] : [Math.min(255, oceanDeep[0] + 30), Math.min(255, oceanDeep[1] + 40), Math.min(255, oceanDeep[2] + 40)];
  const landBase = hexToRgb(palette.land);
  const landDetail = hexToRgb(palette.landDetail);
  const iceColor = [238, 246, 255];
  const beachColor = [194, 178, 128];

  const s = seed * 13.37;

  for (let y = 0; y < h; y++) {
    const lat = ((y / h) * 2 - 1);
    const absLat = Math.abs(lat);

    for (let x = 0; x < w; x++) {
      const u = x / w;
      const nx = Math.sin(u * Math.PI * 2);
      const nz = Math.cos(u * Math.PI * 2);
      const ny = lat;

      let n = 0;
      n += Math.sin(nx * 3.5 + s) * Math.cos(ny * 4.2 + s * 0.7) * 0.50;
      n += Math.sin(nz * 7.1 + s * 1.3) * Math.cos(nx * 6.8 + ny * 5.5) * 0.25;
      n += Math.sin(nx * 14.3 + nz * 12.1 + s * 2.1) * 0.15;
      n += Math.sin(ny * 25.0 + nz * 20.0 + s * 3.7) * 0.10;

      let elevation = (n + 1) * 0.5;
      const isPolarIce = absLat > 0.82 && (elevation > 0.35 || absLat > 0.90);

      let r, g, b;

      if (isPolarIce) {
        r = iceColor[0];
        g = iceColor[1];
        b = iceColor[2];
      } else if (elevation > 0.52) {
        if (elevation < 0.55 && biome === 'temperate') {
          r = beachColor[0];
          g = beachColor[1];
          b = beachColor[2];
        } else if (elevation > 0.72) {
          const t = Math.min(1, (elevation - 0.72) / 0.28);
          r = Math.round(landDetail[0] * (1 - t) + 180 * t);
          g = Math.round(landDetail[1] * (1 - t) + 175 * t);
          b = Math.round(landDetail[2] * (1 - t) + 170 * t);
        } else {
          const t = (elevation - 0.55) / 0.17;
          r = Math.round(landBase[0] * (1 - t) + landDetail[0] * t);
          g = Math.round(landBase[1] * (1 - t) + landDetail[1] * t);
          b = Math.round(landBase[2] * (1 - t) + landDetail[2] * t);
        }
      } else {
        if (elevation > 0.46) {
          const t = (elevation - 0.46) / 0.06;
          r = Math.round(oceanDeep[0] * (1 - t) + oceanShallow[0] * t);
          g = Math.round(oceanDeep[1] * (1 - t) + oceanShallow[1] * t);
          b = Math.round(oceanDeep[2] * (1 - t) + oceanShallow[2] * t);
        } else {
          r = oceanDeep[0];
          g = oceanDeep[1];
          b = oceanDeep[2];
        }
      }

      const idx = (y * w + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Textura limpia sin puntitos/satélites residuales sobre la superficie planetaria

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  setBoundedTexture(textureCache, cacheKey, texture);
  return texture;
}

/**
 * Normal Map procedural para relieve de cordilleras y costas.
 */
export function createPlanetNormalTexture(seed = 1) {
  const cacheKey = `normal_${seed}`;
  if (normalTextureCache.has(cacheKey)) {
    return normalTextureCache.get(cacheKey);
  }

  const canvas = document.createElement('canvas');
  const w = 256;
  const h = 128;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  const s = seed * 13.37;

  for (let y = 0; y < h; y++) {
    const lat = ((y / h) * 2 - 1);
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const nx = Math.sin(u * Math.PI * 2);
      const nz = Math.cos(u * Math.PI * 2);
      const ny = lat;

      let n = Math.sin(nx * 3.5 + s) * Math.cos(ny * 4.2 + s * 0.7) * 0.50
            + Math.sin(nz * 7.1 + s * 1.3) * Math.cos(nx * 6.8 + ny * 6.0) * 0.25
            + Math.sin(nx * 14.3 + nz * 12.1 + s * 2.1) * 0.15;

      const elev = (n + 1) * 0.5;
      const idx = (y * w + x) * 4;

      if (elev > 0.52) {
        const bump = Math.min(255, Math.max(128, Math.round(128 + (elev - 0.52) * 240)));
        data[idx] = bump;
        data[idx + 1] = bump;
        data[idx + 2] = 255;
      } else {
        data[idx] = 128;
        data[idx + 1] = 128;
        data[idx + 2] = 255;
      }
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  setBoundedTexture(normalTextureCache, cacheKey, texture);
  return texture;
}

/**
 * Textura procedural para bandas de nubes y ciclones planetarios.
 */
export function createCloudTexture(cloudColor, seed = 1) {
  const cacheKey = `cloud_${cloudColor}_${seed}`;
  if (cloudTextureCache.has(cacheKey)) {
    return cloudTextureCache.get(cacheKey);
  }

  const canvas = document.createElement('canvas');
  const w = 256;
  const h = 128;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, w, h);

  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  const s = seed * 7.77;

  for (let y = 0; y < h; y++) {
    const lat = ((y / h) * 2 - 1);
    const absLat = Math.abs(lat);

    for (let x = 0; x < w; x++) {
      const u = x / w;
      const nx = Math.sin(u * Math.PI * 2);
      const nz = Math.cos(u * Math.PI * 2);
      const ny = lat;

      let c = 0;
      c += Math.sin(nx * 4.0 + s) * Math.cos(ny * 5.0 + s * 0.8) * 0.45;
      c += Math.sin(nz * 8.0 + s * 1.5) * Math.cos(nx * 7.0 + ny * 6.0) * 0.30;
      c += Math.sin(nx * 16.0 + nz * 14.0 + s * 2.5) * 0.25;

      let density = (c + 1) * 0.5;
      density = Math.pow(density, 1.6);

      const isSubtropicalBand = (absLat > 0.15 && absLat < 0.45) || (absLat > 0.55 && absLat < 0.75);
      const latFactor = isSubtropicalBand ? 1.25 : 0.8;
      const alpha = Math.min(255, Math.max(0, Math.round((density - 0.42) * 440 * latFactor)));

      const idx = (y * w + x) * 4;
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  setBoundedTexture(cloudTextureCache, cacheKey, texture);
  return texture;
}
