import React, { useState } from 'react';
import { REAL_IMAGES, getFallbackImage } from './data/assetsCatalog.js';

// Caché en memoria RAM de imágenes ya creadas/decodificadas para evitar tirones y parpadeos
const imageMemoryCache = new Set();

const preloadImage = (src) => {
  if (!src || typeof window === 'undefined' || imageMemoryCache.has(src)) return;
  imageMemoryCache.add(src);
  const img = new Image();
  img.src = src;
  if (img.decode) {
    img.decode().catch(() => {});
  }
};

// Precargar gradualmente en segundo plano cuando la CPU/GPU esté inactiva sin colapsar el arranque
if (typeof window !== 'undefined') {
  const scheduleIdlePreload = () => {
    const urls = Object.values(REAL_IMAGES || {}).filter(Boolean);
    let index = 0;
    const batchSize = 6;
    function processBatch(deadline) {
      while (index < urls.length && (deadline ? deadline.timeRemaining() > 5 : true)) {
        for (let i = 0; i < batchSize && index < urls.length; i++) {
          preloadImage(urls[index++]);
        }
        if (!deadline) break;
      }
      if (index < urls.length) {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(processBatch, { timeout: 2000 });
        } else {
          setTimeout(processBatch, 250);
        }
      }
    }
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(processBatch, { timeout: 3000 });
    } else {
      setTimeout(processBatch, 1000);
    }
  };

  if (document.readyState === 'complete') {
    setTimeout(scheduleIdlePreload, 2000);
  } else {
    window.addEventListener('load', () => setTimeout(scheduleIdlePreload, 2000));
  }
}

const asset = (filename) => new URL(`../Assets/${filename}`, import.meta.url).href;

const getCardImage = (id, category) => {
  const src = REAL_IMAGES[id];
  if (src) {
    preloadImage(src);
    return src;
  }
  const fallback = getFallbackImage(category, REAL_IMAGES);
  if (fallback) preloadImage(fallback);
  return fallback;
};

export const CardImage = ({ id, category, className = "w-full h-auto object-cover", loading = "lazy" }) => {
  const src = getCardImage(id, category);
  const [hasError, setHasError] = useState(false);
  if (src && !hasError) {
    return (
      <img 
        src={src} 
        alt="" 
        className={className}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onError={() => setHasError(true)}
        loading={loading}
        decoding="async"
      />
    );
  }
  return <div className={`${className} bg-cyan-950/10`} />;
};

export const SafeImg = ({ id, category, className = "w-full h-auto", fallback = null, loading = "lazy" }) => {
  const src = getCardImage(id, category);
  const [hasError, setHasError] = useState(false);
  if (src && !hasError) {
    return (
      <img
        src={src}
        alt=""
        className={`${className} object-cover rounded pointer-events-none select-none`}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onError={() => setHasError(true)}
        loading={loading}
        decoding="async"
      />
    );
  }
  return fallback || <div className={`${className} bg-cyan-950/10 rounded`} />;
};

export const CardBanner = ({ id, category, children, isLocked = false, className = '', loading = "lazy" }) => {
  const src = getCardImage(id, category);
  const [hasError, setHasError] = useState(false);
  return (
    <div className={`relative overflow-hidden w-full aspect-video rounded-xl mb-3 border border-white/10 glass-deep fresnel bg-cyan-950/10 ${className}`}>
      {src && !hasError ? (
        <img
          src={src}
          alt=""
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isLocked ? 'opacity-40 filter grayscale' : ''
          }`}
          onError={() => setHasError(true)}
          loading={loading}
          decoding="async"
        />
      ) : (
        <div className="w-full h-full bg-cyan-950/10" />
      )}
      {children}
    </div>
  );
};

export { asset, getCardImage, REAL_IMAGES, getFallbackImage };
