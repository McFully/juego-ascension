import React, { useState } from 'react';
import { REAL_IMAGES, getFallbackImage } from './data/assetsCatalog.js';

const asset = (filename) => new URL(`../Assets/${filename}`, import.meta.url).href;

const getCardImage = (id, category) => {
  const src = REAL_IMAGES[id];
  if (src) return src;
  return getFallbackImage(category, REAL_IMAGES);
};

export const CardImage = ({ id, category, className = "w-full h-auto object-cover" }) => {
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
        loading="eager"
        decoding="sync"
      />
    );
  }
  return <div className={`${className} bg-[#05070f]`} />;
};

export const SafeImg = ({ id, category, className = "w-full h-auto", fallback = null }) => {
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
        loading="eager"
        decoding="sync"
      />
    );
  }
  return fallback || <div className={`${className} bg-[#05070f] rounded`} />;
};

export const CardBanner = ({ id, category, children, isLocked = false, className = '' }) => {
  const src = getCardImage(id, category);
  const [hasError, setHasError] = useState(false);
  return (
    <div className={`relative overflow-hidden w-full aspect-video rounded-xl mb-3 border border-white/10 glass-deep fresnel ${className}`}>
      {src && !hasError ? (
        <img
          src={src}
          alt=""
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isLocked ? 'opacity-40 filter grayscale' : ''
          }`}
          onError={() => setHasError(true)}
          loading="eager"
          decoding="sync"
        />
      ) : (
        <div className="w-full h-full bg-[#05070f]" />
      )}
      {children}
    </div>
  );
};

export { asset, getCardImage, REAL_IMAGES, getFallbackImage };
