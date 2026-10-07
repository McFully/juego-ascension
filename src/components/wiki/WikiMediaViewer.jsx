import React from 'react';
import { SafeImg } from '../../assets.jsx';

/**
 * WikiMediaViewer — Marco con bisel metálico para imágenes, esquemas técnicos y diagramas
 */
export const WikiMediaViewer = React.memo(({ media }) => {
  if (!media) return null;

  return (
    <div className="bg-[#050711]/90 rounded-xl border border-white/10 overflow-hidden shadow-lg space-y-2">
      <div className="relative w-full aspect-video max-h-[320px] bg-black/60 overflow-hidden flex items-center justify-center">
        {media.assetId ? (
          <SafeImg
            id={media.assetId}
            className="w-full h-full object-cover object-center"
            fallback={
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-slate-500 font-mono text-xs gap-2 p-4">
                <span className="text-3xl">🏛️</span>
                <span>Esquema Técnico Holográfico</span>
              </div>
            }
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-slate-500 font-mono text-xs gap-2 p-4">
            <span className="text-3xl">🏛️</span>
            <span>Archivo Holográfico Imperial</span>
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {media.caption && (
        <div className="px-4 py-2 border-t border-white/5 text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span className="text-cyan-400">📷</span>
          <span>{media.caption}</span>
        </div>
      )}
    </div>
  );
});

WikiMediaViewer.displayName = 'WikiMediaViewer';
