import React, { useState, useEffect } from 'react';
import { S } from '../../styles.js';
import { CardBanner } from '../../assets.jsx';
import { fmtTime } from '../../core.jsx';
import { CancelConfirmationModal } from './CancelConfirmationModal.jsx';
import { ItemCardActiveOverlay } from './ItemCard/ItemCardActiveOverlay.jsx';
import { ItemCardCostSection } from './ItemCard/ItemCardCostSection.jsx';
import { ItemCardProductionInfo } from './ItemCard/ItemCardProductionInfo.jsx';
import { AutomationRestrictionToggle } from './AutomationRestrictionToggle.jsx';

/**
 * ItemCard — Tarjeta de videojuego de estrategia con progresión visual,
 * estados diferenciados, barras de nivel, indicador de construcción activa y costes detallados.
 */
export const ItemCard = React.memo(({
  icon,
  name,
  level,
  cost,
  canAfford,
  meetsRequirements,
  lackOfPop,
  time,
  onAction,
  actionLabel,
  extra,
  prodInfo,
  maxLevel,
  maxReached,
  id,
  onOpenCodex,
  category,
  onOpenInterior,
  activeQueueItem,
  queueItems = [],
  onCancelQueue,
  isAutoRestricted = false,
  onToggleAutoRestriction,
  planetResources,
  isQueueFull = false
}) => {
  const [clicked, setClicked] = useState(false);
  const [selectedCancelItem, setSelectedCancelItem] = useState(null);
  const handleCancelClose = React.useCallback(() => setSelectedCancelItem(null), []);
  const cardRef = React.useRef(null);

  const handleMouseMove = React.useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  useEffect(() => {
    if (clicked) {
      const t = setTimeout(() => setClicked(false), 500);
      return () => clearTimeout(t);
    }
  }, [clicked]);

  // Lista unificada de órdenes activas
  const allQueueItems = queueItems && queueItems.length > 0 
    ? queueItems 
    : (activeQueueItem ? [activeQueueItem] : []);
  const hasQueue = allQueueItems.length > 0;

  // Determine visual state
  const getStateClass = () => {
    if (hasQueue) return 'border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
    if (maxReached) return 'state-completed';
    if (!meetsRequirements) return 'state-locked';
    if (lackOfPop) return 'state-locked';
    if (!canAfford) return 'state-no-resources';
    if (isQueueFull) return 'border-amber-500/40 bg-[#090d1f]/90';
    return 'state-available';
  };

  const stateClass = getStateClass();
  const isUpgradeable = canAfford && meetsRequirements && !lackOfPop && !maxReached && !isQueueFull;

  // Status badge
  const getStatusBadge = () => {
    if (maxReached) return { text: '✅ MAX', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (!meetsRequirements) return { text: '🔒 Bloqueado', bg: 'bg-red-500/15 text-red-400 border-red-500/25' };
    if (lackOfPop) return { text: '👥 Falta Población', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (!canAfford) return { text: '💸 Sin recursos', bg: 'bg-red-500/10 text-red-300 border-red-500/20' };
    if (isQueueFull) return { text: '⏳ Cola llena (8/8)', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    if (isUpgradeable) return { text: '⬆️ Mejorable', bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 pulse-glow' };
    return null;
  };
  const badge = getStatusBadge();

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`${S.card} ${stateClass} relative group flex flex-col justify-between`}
    >
      <div>
        <CardBanner id={id} category={category}>
          {onToggleAutoRestriction && (
            <AutomationRestrictionToggle
              isRestricted={isAutoRestricted}
              onToggle={onToggleAutoRestriction}
            />
          )}

          {badge && !hasQueue && (
            <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border shadow-md ${badge.bg} z-10 backdrop-blur-sm`}>
              {badge.text}
            </div>
          )}

          {hasQueue && (
            <ItemCardActiveOverlay
              activeQueueItem={allQueueItems[0]}
              queueItems={allQueueItems}
              onCancelQueueItem={(item) => setSelectedCancelItem(item)}
            />
          )}
        </CardBanner>

        {/* Header: Name + Level */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white text-base drop-shadow-[0_0_2px_rgba(255,255,255,0.3)] truncate">{name}</span>
              <button onClick={(e) => { e.stopPropagation(); onOpenCodex(id); }}
                className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-[var(--ue-accent)] hover:border-[var(--ue-accent)]/40 hover:bg-[var(--ue-accent)]/10 transition-all shrink-0 group/info"
                title="Ver detalles"
              >
                <span className="material-symbols-outlined text-[12px] group-hover/info:scale-110 transition-transform">menu_book</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Nivel</span>
              <span className="text-lg font-black text-white tabular-nums">{level}</span>
              {maxLevel && <span className="text-[10px] text-slate-600 font-mono">/ {maxLevel}</span>}
            </div>

            {!maxReached && (
              <div className="mt-1.5 mb-2">
                <div className="w-full h-1.5 bg-[#05070f] rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                    style={{
                      width: maxLevel ? `${Math.min(100, (level / maxLevel) * 100)}%` : `${Math.min(90, level * 8)}%`,
                      boxShadow: '0 0 8px rgba(6,182,212,0.4)',
                    }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[8px] text-slate-600 font-mono">Nv.{level}</span>
                  <span className="text-[8px] text-cyan-500/60 font-mono">→ Nv.{level + 1}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info de Producción Submodularizada */}
        <ItemCardProductionInfo prodInfo={prodInfo} level={level} />

        {extra && <div className="text-xs text-slate-400 mb-2">{extra}</div>}

        {/* Sección de Costes Submodularizada */}
        <ItemCardCostSection cost={cost} time={time} canAfford={canAfford} planetResources={planetResources} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={(e) => { onAction(e); }}
          disabled={!canAfford || !meetsRequirements || lackOfPop || maxReached || isQueueFull}
          className={`flex-1 ${S.btn} ${isUpgradeable ? S.btnPrimary + ' hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]' : S.btnGhost} focus-ring-game`}
        >
          {maxReached ? '✅ Máximo alcanzado'
            : !meetsRequirements ? '🔒 Requisitos'
            : lackOfPop ? '👥 Falta Población'
            : !canAfford ? '💸 Sin recursos'
            : isQueueFull ? '⏳ Cola llena (8/8)'
            : actionLabel}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onOpenCodex(id); }}
          className={`px-3 ${S.btn} ${S.btnGhost} flex items-center justify-center focus-ring-game`}
          title="Ver detalles"
        >
          ℹ️
        </button>
        {onOpenInterior && level > 0 && (
          <button onClick={(e) => { e.stopPropagation(); onOpenInterior(id); }}
            className={`px-2.5 ${S.btn} bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 flex items-center justify-center transition focus-ring-game`}
            title="Abrir Consola Operativa del Edificio"
          >
            ⚙️
          </button>
        )}
      </div>

      {/* Modal de Confirmación de Cancelación */}
      {selectedCancelItem && (
        <CancelConfirmationModal
          isOpen={Boolean(selectedCancelItem)}
          onClose={handleCancelClose}
          onConfirm={() => {
            if (onCancelQueue) onCancelQueue(selectedCancelItem.id);
            setSelectedCancelItem(null);
          }}
          title={selectedCancelItem.researchId ? 'Cancelar Investigación' : 'Cancelar Construcción'}
          itemName={name}
          itemLevel={selectedCancelItem.level}
          type={selectedCancelItem.researchId ? 'research' : 'building'}
        />
      )}
    </div>
  );
});
