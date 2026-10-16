import React, { useState } from 'react';
import { REAL_IMAGES, getFallbackImage } from './data/assetsCatalog.js';
import { CARD_THUMBNAILS_BY_ID } from './data/cardThumbnailsById.js';

// Caché en memoria RAM de imágenes ya solicitadas
const imageMemoryCache = new Set();

const preloadImage = (src) => {
  if (!src || typeof window === 'undefined' || imageMemoryCache.has(src)) return;
  imageMemoryCache.add(src);
  const img = new Image();
  img.src = src;
};

const cardAsset = (filename) => new URL(`../Assets/cards/${filename}`, import.meta.url).href;
const asset = (filename) => new URL(`../Assets/${filename}`, import.meta.url).href;

// Cache de mapeo de miniaturas seguras con fallback al original
const cardImageCache = new Map();

export const getCardThumbnail = (fullSrc) => {
  if (!fullSrc || typeof fullSrc !== 'string') return fullSrc;
  return fullSrc;
};

// Obtener imagen en alta definición completa (para modales de detalles o zoom)
export const getFullImage = (id, category) => {
  const src = REAL_IMAGES[id];
  if (src) return src;
  return getFallbackImage(category, REAL_IMAGES);
};

// Obtener miniatura optimizada para la tarjeta (ultra fluidez en navegación y 100% compatible con Vite/Electron)
const getCardImage = (id, category) => {
  if (id && CARD_THUMBNAILS_BY_ID[id]) {
    return CARD_THUMBNAILS_BY_ID[id];
  }
  return REAL_IMAGES[id] || getFallbackImage(category, REAL_IMAGES) || null;
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
