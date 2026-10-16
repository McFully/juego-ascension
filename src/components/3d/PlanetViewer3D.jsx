import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  BIOME_PALETTES,
  createPlanetTexture,
  createPlanetNormalTexture,
  createCloudTexture
} from './planetTextureGen.js';





export const PlanetViewer3D = ({
  biome = 'temperate',
  name = 'Planeta',
  size = 180,
  planet = null,
  isVirgin: propIsVirgin = null,
  isMarket: propIsMarket = null,
  defenseLevel: propDefenseLevel = null,
  debrisAmount: propDebrisAmount = null,
}) => {
  const mountRef = useRef(null);

  // Derivación segura de propiedades tácticas con fallback
  const population = Number(planet?.population ?? 0);
  const buildings = planet?.buildings || {};
  const buildingLevels = Object.values(buildings).reduce((a, b) => a + Number(b || 0), 0);
  const defenses = planet?.defenses || {};
  const defenseCount = propDefenseLevel !== null 
    ? Number(propDefenseLevel) 
    : Object.values(defenses).reduce((a, b) => a + Number(b || 0), 0);

  const isVirgin = propIsVirgin !== null 
    ? Boolean(propIsVirgin) 
    : (population <= 0 && buildingLevels <= 0);

  const isMarket = propIsMarket !== null
    ? Boolean(propIsMarket)
    : Boolean(planet?.isMarket || planet?.specialization === 'trade' || planet?.name?.toLowerCase().includes('lonja'));

  const debrisAmount = propDebrisAmount !== null
    ? Number(propDebrisAmount)
    : Number(planet?.debris || planet?.spaceDebris || 0);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Escena, cámara y renderizador Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 3.0;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
      renderer.setSize(size, size);
      renderer.setPixelRatio(1);
      currentMount.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('[PlanetViewer3D] WebGL no disponible o bloqueado:', e);
      return;
    }

    const palette = BIOME_PALETTES[biome] || BIOME_PALETTES.temperate;

    // Calcular semilla reproducible a partir del nombre o coordenadas
    let nameSeed = 1;
    const seedSource = planet ? `${planet.galaxy || 1}_${planet.system || 1}_${planet.position || 1}_${planet.name || name}` : name;
    if (seedSource) {
      for (let i = 0; i < seedSource.length; i++) {
        nameSeed = ((nameSeed << 5) - nameSeed) + seedSource.charCodeAt(i);
        nameSeed |= 0;
      }
      nameSeed = Math.abs(nameSeed) || 1;
    }

    // 1. Texturas dinámicas
    const planetTexture = createPlanetTexture(palette, biome, nameSeed, population, buildingLevels, debrisAmount);
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
    planetMesh.rotation.z = 0.32;
    scene.add(planetMesh);

    // 3. Capa de nubes exterior
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
      color: isMarket ? '#fbbf24' : palette.glow,
      transparent: true,
      opacity: isMarket ? 0.38 : 0.28,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    scene.add(atmosMesh);

    // 10. Iluminación solar angular con claro contraste día/noche
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(4, 2, 3.5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(palette.glow, 0.25);
    scene.add(ambientLight);

    // Bucle de animación limitado a 30 FPS para ahorro drástico de GPU/batería
    let animationFrameId;
    let isVisible = typeof document !== 'undefined' ? !document.hidden : true;
    let isInViewport = true;
    let lastFrameTime = 0;
    const FRAME_INTERVAL = 1000 / 30; // ~33.33ms (30 FPS)

    const onVisibilityChange = () => {
      isVisible = typeof document !== 'undefined' ? !document.hidden : true;
      if (isVisible && isInViewport && !animationFrameId) {
        lastFrameTime = performance.now();
        animate(lastFrameTime);
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
          lastFrameTime = performance.now();
          animate(lastFrameTime);
        }
      }, { threshold: 0.05 });
      observer.observe(currentMount);
    }

    const animate = (currentTime = performance.now()) => {
      if (!isVisible || !isInViewport) {
        animationFrameId = null;
        return;
      }
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = currentTime - lastFrameTime;
      if (elapsed < FRAME_INTERVAL) {
        return; // Salta el frame para asegurar exactamente 30 FPS
      }
      lastFrameTime = currentTime - (elapsed % FRAME_INTERVAL);

      planetMesh.rotation.y += 0.007;
      cloudMesh.rotation.y += 0.0104;

      renderer.render(scene, camera);
    };
    lastFrameTime = performance.now();
    animate(lastFrameTime);

    // Limpieza estricta de geometrías y renderizador WebGL
    return () => {
      if (observer) observer.disconnect();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer) {
        try {
          renderer.forceContextLoss();
          renderer.dispose();
        } catch (_) {}
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
    };
  }, [biome, name, size, isMarket]);

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
