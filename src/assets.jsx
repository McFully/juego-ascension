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
    const urls = Object.values(REAL_IMAGES || {})
      .filter(Boolean)
      .map(url => getCardThumbnail(url));
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

const cardAsset = (filename) => new URL(`../Assets/cards/${filename}`, import.meta.url).href;
const asset = (filename) => new URL(`../Assets/${filename}`, import.meta.url).href;

// Cache de mapeo de miniaturas seguras con fallback al original
const cardImageCache = new Map();

export const getCardThumbnail = (fullSrc) => {
  if (!fullSrc || typeof fullSrc !== 'string') return fullSrc;
  if (cardImageCache.has(fullSrc)) return cardImageCache.get(fullSrc);

  let thumbSrc = fullSrc;
  try {
    const parsed = new URL(fullSrc, window?.location?.href || 'http://localhost');
    const pathname = decodeURIComponent(parsed.pathname);
    const filename = pathname.split('/').pop();
    if (filename && filename.toLowerCase().endsWith('.webp')) {
      thumbSrc = cardAsset(filename);
    }
  } catch {
    thumbSrc = fullSrc;
  }

  cardImageCache.set(fullSrc, thumbSrc);
  return thumbSrc;
};

// Obtener imagen en alta definición completa (para modales de detalles o zoom)
export const getFullImage = (id, category) => {
  const src = REAL_IMAGES[id];
  if (src) {
    preloadImage(src);
    return src;
  }
  const fallback = getFallbackImage(category, REAL_IMAGES);
  if (fallback) preloadImage(fallback);
  return fallback;
};

// Obtener miniatura optimizada para la tarjeta (ultra fluidez en navegación)
const getCardImage = (id, category) => {
  const fullSrc = REAL_IMAGES[id] || getFallbackImage(category, REAL_IMAGES);
  if (!fullSrc) return null;
  const thumbSrc = getCardThumbnail(fullSrc);
  preloadImage(thumbSrc);
  return thumbSrc;
};

export const CardImage = ({ id, category, className = "w-full h-auto object-cover", loading = "lazy", fullRes = false }) => {
  const src = fullRes ? getFullImage(id, category) : getCardImage(id, category);
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

export const SafeImg = ({ id, category, className = "w-full h-auto", fallback = null, loading = "lazy", fullRes = false }) => {
  const src = fullRes ? getFullImage(id, category) : getCardImage(id, category);
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

export const CardBanner = ({ id, category, children, isLocked = false, className = '', loading = "lazy", fullRes = false }) => {
  const src = fullRes ? getFullImage(id, category) : getCardImage(id, category);
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

export { asset, cardAsset, getCardImage, REAL_IMAGES, getFallbackImage };
