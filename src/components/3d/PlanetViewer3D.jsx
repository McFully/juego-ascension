import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BIOME_PALETTES = {
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

/**
 * Genera de forma procedural una textura equirrectangular orgánica para la superficie del planeta.
 * Utiliza armónicos sinusoidales compuestos (ruido pseudo-fractal 2D) para crear masas continentales
 * con costas fracturadas, golfos, islas, aguas poco profundas y casquetes polares glaciares.
 */
const textureCache = new Map();

function createPlanetTexture(palette, biome = 'temperate', seed = 1) {
  const cacheKey = `planet_${biome}_${seed}`;
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

  // Helper para convertir hex a [r, g, b]
  const hexToRgb = (hex) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  const oceanDeep = hexToRgb(palette.ocean);
  // Aguas someras en costas (color turquesa / azul plataforma continental)
  const oceanShallow = biome === 'temperate' ? [24, 98, 140] : [Math.min(255, oceanDeep[0] + 30), Math.min(255, oceanDeep[1] + 40), Math.min(255, oceanDeep[2] + 40)];
  const landBase = hexToRgb(palette.land);
  const landDetail = hexToRgb(palette.landDetail);
  const iceColor = [238, 246, 255]; // Hielo polar realista
  const beachColor = [194, 178, 128]; // Arena de playa

  const s = seed * 13.37;

  for (let y = 0; y < h; y++) {
    // Latitud normalizada de -1 (Polo Norte) a +1 (Polo Sur)
    const lat = ((y / h) * 2 - 1);
    const absLat = Math.abs(lat);
    const v = y / h;

    for (let x = 0; x < w; x++) {
      const u = x / w;
      // Coordenadas esféricas envueltas para costura continua en equirrectangular
      const nx = Math.sin(u * Math.PI * 2);
      const nz = Math.cos(u * Math.PI * 2);
      const ny = lat;

      // Armónicos sinusoidales multi-escala para fractal continental orgánico
      let n = 0;
      n += Math.sin(nx * 3.5 + s) * Math.cos(ny * 4.2 + s * 0.7) * 0.50;
      n += Math.sin(nz * 7.1 + s * 1.3) * Math.cos(nx * 6.8 + ny * 5.5) * 0.25;
      n += Math.sin(nx * 14.3 + nz * 12.1 + s * 2.1) * 0.15;
      n += Math.sin(ny * 25.0 + nz * 20.0 + s * 3.7) * 0.10;

      // Normalizar elevación [-1..1] -> [0..1]
      let elevation = (n + 1) * 0.5;

      // Casquetes polares glaciares en polos (especialmente en templado/tundra)
      const isPolarIce = absLat > 0.82 && (elevation > 0.35 || absLat > 0.90);

      let r, g, b;

      if (isPolarIce) {
        // Nieve / Glaciares en los extremos polares
        r = iceColor[0];
        g = iceColor[1];
        b = iceColor[2];
      } else if (elevation > 0.52) {
        // Masa continental emergida
        if (elevation < 0.55 && biome === 'temperate') {
          // Playas / Costas
          r = beachColor[0];
          g = beachColor[1];
          b = beachColor[2];
        } else if (elevation > 0.72) {
          // Tierras altas, cordilleras y montañas
          const t = Math.min(1, (elevation - 0.72) / 0.28);
          r = Math.round(landDetail[0] * (1 - t) + 180 * t);
          g = Math.round(landDetail[1] * (1 - t) + 175 * t);
          b = Math.round(landDetail[2] * (1 - t) + 170 * t);
        } else {
          // Bosques, llanuras y bioma base
          const t = (elevation - 0.55) / 0.17;
          r = Math.round(landBase[0] * (1 - t) + landDetail[0] * t);
          g = Math.round(landBase[1] * (1 - t) + landDetail[1] * t);
          b = Math.round(landBase[2] * (1 - t) + landDetail[2] * t);
        }
      } else {
        // Océano profundo o plataforma costera
        if (elevation > 0.46) {
          // Aguas someras costeras (Arrecifes / plataforma continental)
          const t = (elevation - 0.46) / 0.06;
          r = Math.round(oceanDeep[0] * (1 - t) + oceanShallow[0] * t);
          g = Math.round(oceanDeep[1] * (1 - t) + oceanShallow[1] * t);
          b = Math.round(oceanDeep[2] * (1 - t) + oceanShallow[2] * t);
        } else {
          // Fosas oceánicas y mar profundo
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

  // Micro-luces de colonias en la superficie en áreas terrestres
  ctx.fillStyle = palette.cityLights;
  for (let i = 0; i < 40; i++) {
    const lx = Math.floor(((i * 97 + seed * 31) % (w - 10)));
    const ly = 60 + Math.floor(((i * 61 + seed * 17) % (h - 120)));
    ctx.fillRect(lx, ly, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set(cacheKey, texture);
  return texture;
}

const normalTextureCache = new Map();

/**
 * Genera mapa de relieve (normal map) sincrónico con las costas y montañas orgánicas.
 */
function createPlanetNormalTexture(seed = 1) {
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
            + Math.sin(nz * 7.1 + s * 1.3) * Math.cos(nx * 6.8 + ny * 5.5) * 0.25
            + Math.sin(nx * 14.3 + nz * 12.1 + s * 2.1) * 0.15;

      const elev = (n + 1) * 0.5;
      const idx = (y * w + x) * 4;

      if (elev > 0.52) {
        // Continentes y cordilleras con relieve
        const bump = Math.min(255, Math.max(128, Math.round(128 + (elev - 0.52) * 240)));
        data[idx] = bump;
        data[idx + 1] = bump;
        data[idx + 2] = 255;
      } else {
        // Océano plano liso (normal neutra)
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
  normalTextureCache.set(cacheKey, texture);
  return texture;
}

const cloudTextureCache = new Map();

/**
 * Genera nubes atmosféricas orgánicas fluidas mediante bandas ciclónicas ecuatoriales y templadas.
 */
function createCloudTexture(cloudColor, seed = 1) {
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

  ctx.clearRect(0, 0, w, h);

  // Vórtices y bandas nubosas con degradados suaves
  for (let i = 0; i < 30; i++) {
    const cx = ((i * 71 + seed * 23) % w);
    const cy = 20 + ((i * 43 + seed * 19) % (h - 40));
    const radX = 25 + ((i * 17) % 45);
    const radY = 8 + ((i * 11) % 15);

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radX);
    grad.addColorStop(0, cloudColor);
    grad.addColorStop(0.5, 'rgba(255,255,255,0.25)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radX, radY, (i * 0.18), 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  cloudTextureCache.set(cacheKey, texture);
  return texture;
}

export const PlanetViewer3D = ({ biome = 'temperate', name = 'Planeta', size = 180 }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Escena, cámara y renderizador Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 2.85;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      currentMount.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('[PlanetViewer3D] WebGL no disponible o bloqueado:', e);
      return;
    }

    const palette = BIOME_PALETTES[biome] || BIOME_PALETTES.temperate;

    // Calcular semilla reproducible a partir del nombre para que cada planeta tenga geografía única y constante
    let nameSeed = 1;
    if (name) {
      for (let i = 0; i < name.length; i++) {
        nameSeed = ((nameSeed << 5) - nameSeed) + name.charCodeAt(i);
        nameSeed |= 0;
      }
      nameSeed = Math.abs(nameSeed) || 1;
    }

    // 1. Texturas dinámicas (Fractal orgánico continental + Normal Map para relieve 3D + Nubes ciclónicas)
    const planetTexture = createPlanetTexture(palette, biome, nameSeed);
    const planetNormalTexture = createPlanetNormalTexture(nameSeed);
    const cloudTexture = createCloudTexture(palette.clouds, nameSeed);

    // 2. Esfera de superficie planetaria
    const planetGeometry = new THREE.SphereGeometry(1, 48, 48);
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: planetTexture || null,
      normalMap: planetNormalTexture || null,
      normalScale: new THREE.Vector2(0.35, 0.35),
      color: planetTexture ? 0xffffff : (palette.land || 0x1b4d3e),
      roughness: palette.roughness ?? 0.6,
      metalness: palette.metalness ?? 0.15,
    });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    // Ligera inclinación axial planetaria realista (~18 grados)
    planetMesh.rotation.z = 0.32;
    scene.add(planetMesh);

    // 3. Capa de nubes exterior girando a distinta velocidad
    const cloudGeometry = new THREE.SphereGeometry(1.02, 36, 36);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: cloudTexture || null,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudMesh.rotation.z = 0.32;
    scene.add(cloudMesh);

    // 4. Atmósfera exterior suave (Fresnel / glow)
    const atmosGeometry = new THREE.SphereGeometry(1.06, 32, 32);
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: palette.glow,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    scene.add(atmosMesh);

    // 5. Iluminación solar angular con claro contraste día/noche
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(4, 2, 3.5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(palette.glow, 0.25);
    scene.add(ambientLight);

    // Bucle de animación (60 FPS rotación fluida con pausa automática si la pestaña o elemento no es visible)
    let animationFrameId;
    let isVisible = typeof document !== 'undefined' ? !document.hidden : true;
    let isInViewport = true;

    const onVisibilityChange = () => {
      isVisible = typeof document !== 'undefined' ? !document.hidden : true;
      if (isVisible && isInViewport && !animationFrameId) {
        animate();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange);
    }

    let observer = null;
    if (typeof IntersectionObserver !== 'undefined' && currentMount) {
      observer = new IntersectionObserver(([entry]) => {
        isInViewport = entry.isIntersecting;
        if (isInViewport && isVisible && !animationFrameId) {
          animate();
        }
      }, { threshold: 0.05 });
      observer.observe(currentMount);
    }

    const animate = () => {
      if (!isVisible || !isInViewport) {
        animationFrameId = null;
        return;
      }
      planetMesh.rotation.y += 0.0035;
      cloudMesh.rotation.y += 0.0052; // Nubes más veloces para sensación de volumen
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Limpieza estricta de geometrías y renderizador WebGL (preservando texturas en caché de memoria)
    return () => {
      if (observer) observer.disconnect();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer) {
        try {
          const gl = renderer.getContext();
          const loseContextExt = gl && gl.getExtension ? gl.getExtension('WEBGL_lose_context') : null;
          if (loseContextExt) loseContextExt.loseContext();
        } catch (_) {}
        renderer.dispose();
        if (currentMount.contains(renderer.domElement)) {
          currentMount.removeChild(renderer.domElement);
        }
      }
      try {
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      } catch (_) {}
      planetGeometry.dispose();
      planetMaterial.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      atmosGeometry.dispose();
      atmosMaterial.dispose();
    };
  }, [biome, name, size]);

  return (
    <div className="relative flex flex-col items-center justify-center pointer-events-none select-none">
      <div
        ref={mountRef}
        style={{ width: size, height: size }}
        className="relative z-10 drop-shadow-[0_0_25px_rgba(6,182,212,0.35)]"
      />
    </div>
  );
};

export default PlanetViewer3D;
