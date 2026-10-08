import React from 'react';
import { SafeImg } from '../../../assets.jsx';

export const HubCard = React.memo(({
  onClick,
  borderColor,
  hoverBorderColor,
  hoverShadow,
  assetId,
  badgeText,
  badgeClasses,
  title,
  icon,
  description,
  footerLabel,
  footerValue,
  footerValueClasses,
  footerAction = null,
  headerAction = null,
  imageOverlay = null,
  titleHoverColor = 'group-hover:text-cyan-300',
  isLocked = false,
  lockReason = '',
  imageCoverProps = null,
  isDragging = false,
  isPressing = false,
  isReordering = false,
  onMoveLeft = null,
  onMoveRight = null,
  canMoveLeft = false,
  canMoveRight = false
}) => {
  return (
    <div
      {...(isReordering ? (imageCoverProps || {}) : {})}
      onClick={(e) => {
        if (isLocked || isDragging) return;
        if (window.playSfx) window.playSfx('click');
        if (onClick) onClick(e);
      }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-200 select-none text-left focus:outline-none w-full h-full ${
        isDragging
          ? 'ring-2 ring-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.6)] z-50 opacity-95 scale-[1.03]'
          : isLocked
          ? 'border-rose-900/40 bg-[#08040a]/70 hover:border-rose-500/50 hover:bg-[#120714] cursor-not-allowed'
          : `bg-[#090d1f]/95 hover:bg-[#0e1633] hover:scale-[1.01] cursor-pointer ${borderColor || 'border-cyan-500/30'} ${hoverBorderColor || 'hover:border-cyan-400'} ${hoverShadow || ''}`
      }`}
    >
      <div
        {...(imageCoverProps || {})}
        className={`relative w-full h-52 xl:h-56 overflow-hidden bg-[#05070f] border-b border-white/10 ${
          imageCoverProps ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        {isPressing && (
          <div className="absolute inset-0 z-40 bg-cyan-500/25 backdrop-blur-[1px] flex items-center justify-center pointer-events-none animate-pulse">
            <span className="text-xs font-mono font-black text-cyan-200 bg-black/85 px-3 py-1.5 rounded-full border border-cyan-400 shadow-xl">
              ✋ Arrastrando...
            </span>
          </div>
        )}
        {assetId ? (
          <SafeImg
            id={assetId}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isLocked ? 'opacity-40 filter grayscale' : 'opacity-90 group-hover:opacity-100 group-hover:scale-105'
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`text-5xl transition-transform ${isLocked ? 'opacity-40' : 'group-hover:scale-110'}`}>{icon}</span>
          </div>
        )}

        {isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-4xl filter drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">🔒</span>
          </div>
        )}
        
        {isLocked && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(244,63,94,0.3)] bg-rose-950/80 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
            <span>🔒</span>
            <span>BLOQUEADO</span>
          </span>
        )}

        {imageOverlay && (
          <div className="absolute top-2.5 right-2.5 z-40">
            {imageOverlay}
          </div>
        )}

        {/* Barra superior de controles rápidos cuando el modo reordenar está activo */}
        {isReordering && (
          <div className="absolute top-2 left-2 z-50 flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-xl">
            <button
              type="button"
              disabled={!canMoveLeft}
              onClick={(e) => {
                e.stopPropagation();
                if (onMoveLeft) onMoveLeft();
              }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                canMoveLeft
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-400/50 cursor-pointer active:scale-95'
                  : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
              }`}
              title="Mover hacia la izquierda"
            >
              ◀
            </button>
            <button
              type="button"
              disabled={!canMoveRight}
              onClick={(e) => {
                e.stopPropagation();
                if (onMoveRight) onMoveRight();
              }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                canMoveRight
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-400/50 cursor-pointer active:scale-95'
                  : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
              }`}
              title="Mover hacia la derecha"
            >
              ▶
            </button>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col justify-start flex-1 min-h-[84px]">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className={`text-xs xl:text-sm font-black uppercase tracking-wide transition-colors truncate ${
              isLocked ? 'text-slate-400' : `text-white ${titleHoverColor}`
            }`}>
              <span>{title}</span>
            </h3>
            {headerAction && (
              <div className="shrink-0">
                {headerAction}
              </div>
            )}
          </div>

          {isLocked ? (
            <div className="mt-1.5 p-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[10px] xl:text-[11px] font-mono leading-relaxed text-rose-300">
              <span className="font-bold text-rose-400 inline-flex items-center gap-1 mr-1.5">
                <span>⚠️</span> Requisito:
              </span>
              <span>{lockReason || 'Instalación o requisito no disponible.'}</span>
            </div>
          ) : (
            <p className="text-[11px] xl:text-xs text-slate-400 font-mono mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {footerLabel && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">{footerLabel}</span>
            <span className={`font-bold ${isLocked ? 'text-rose-400/80' : (footerValueClasses || 'text-cyan-400')}`}>
              {isLocked ? 'Bloqueado' : footerValue}
            </span>
          </div>
        )}

        {footerAction && !isLocked && (
          <div className="mt-3">{footerAction}</div>
        )}
      </div>
    </div>
  );
});

export default HubCard;
