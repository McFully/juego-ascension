/**
 * systemPreloader.js — Orquestador de Precarga Integral de Subsistemas
 * 
 * Precalienta en paralelo durante el arranque (IntroSplashPreload):
 * 1. Catálogo de imágenes completo (decodificación GPU con img.decode()).
 * 2. Módulos y pantallas pesadas de Vite (Dynamic Chunks).
 * 3. Contexto WebGL y shaders de Three.js.
 * 4. AudioContext y grafo de audio.
 * 5. Conexión de persistencia SQLite local.
 */
import { REAL_IMAGES } from '../data/assetsCatalog.js';
import { getCtx } from '../audio.js';

export async function runSystemPreload(onProgress) {
  let totalTasks = 0;
  let completedTasks = 0;

  const notify = () => {
    if (typeof onProgress === 'function') {
      const pct = totalTasks > 0 ? Math.min(100, Math.round((completedTasks / totalTasks) * 100)) : 100;
      onProgress(pct);
    }
  };

  // 1. Catálogo Gráfico (Imágenes maestras)
  const imageUrls = Object.values(REAL_IMAGES || {}).filter(Boolean);
  totalTasks += imageUrls.length;

  // 2. Chunks de Pistas Secundarias (Vite dynamic imports)
  const chunkLoaders = [
    () => import('../pages/GalaxyPage.jsx'),
    () => import('../pages/CombatPage.jsx'),
    () => import('../pages/FleetPage.jsx'),
    () => import('../pages/TechTreePage.jsx'),
    () => import('../pages/DiplomacyPage.jsx'),
    () => import('../pages/CommunicationsPage.jsx'),
    () => import('../pages/GalacticMarketPage.jsx'),
    () => import('../pages/GalacticBankPage.jsx'),
    () => import('../pages/PlanetaryBankPage.jsx'),
    () => import('../components/sectors/SectorManagementView.jsx'),
    () => import('../components/3d/PlanetViewer3D.jsx')
  ];
  totalTasks += chunkLoaders.length;

  // 3. Tareas de Calentamiento (WebGL, Audio, SQLite)
  totalTasks += 3;

  // Ejecución 1: Precalentar AudioContext
  try {
    getCtx();
  } catch (_) {}
  completedTasks++;
  notify();

  // Ejecución 2: Precalentar WebGL Context (Three.js warm-up)
  try {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }
  } catch (_) {}
  completedTasks++;
  notify();

  // Ejecución 3: Precargar SQLite listSaves
  try {
    if (typeof window !== 'undefined' && window.electronAPI?.listSaves) {
      await window.electronAPI.listSaves().catch(() => {});
    }
  } catch (_) {}
  completedTasks++;
  notify();

  // Ejecución 4: Chunks en segundo plano
  const chunkPromises = chunkLoaders.map(async (loader) => {
    try {
      await loader();
    } catch (_) {}
    completedTasks++;
    notify();
  });

  // Ejecución 5: Imágenes en paralelo en GPU
  const imagePromises = imageUrls.map(async (src) => {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.src = src;
        const finish = () => {
          completedTasks++;
          notify();
          resolve();
        };
        if (img.decode) {
          img.decode().then(finish).catch(finish);
        } else {
          img.onload = finish;
          img.onerror = finish;
        }
      } catch (_) {
        completedTasks++;
        notify();
        resolve();
      }
    });
  });

  await Promise.all([...chunkPromises, ...imagePromises]);
  notify();
}
