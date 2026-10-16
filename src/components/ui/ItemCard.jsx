import React, { useState, useEffect } from 'react';
import { S } from '../../styles.js';
import { CardBanner } from '../../assets.jsx';
import { fmtTime } from '../../core.jsx';
import { CancelConfirmationModal } from './CancelConfirmationModal.jsx';
import { ItemCardActiveOverlay } from './ItemCard/ItemCardActiveOverlay.jsx';
import { ItemCardCostSection } from './ItemCard/ItemCardCostSection.jsx';
import { ItemCardProductionInfo } from './ItemCard/ItemCardProductionInfo.jsx';
import { ItemCardWorkforceSection } from './ItemCard/ItemCardWorkforceSection.jsx';
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
  isQueueFull = false,
  lockReason = null
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

          {!meetsRequirements && !hasQueue && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border shadow-md bg-rose-950/80 text-rose-300 border-rose-500/40 z-10 backdrop-blur-sm flex items-center gap-1">
              <span>🔒</span>
              <span>Bloqueado</span>
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

        {/* Header: Name + Level con Consola Operativa alineada a la derecha */}
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white text-base drop-shadow-[0_0_2px_rgba(255,255,255,0.3)] truncate">{name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Nivel</span>
              <span className="text-lg font-black text-white tabular-nums">{level}</span>
              {maxLevel && <span className="text-[10px] text-slate-600 font-mono">/ {maxLevel}</span>}
            </div>
          </div>

          {onOpenInterior && level > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenInterior(id); }}
              className="p-2 self-center rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md focus-ring-game shrink-0"
              title="Abrir Consola Operativa del Edificio"
              aria-label="Abrir Consola Operativa del Edificio"
              data-ui-audit-id={`btn-console-${id}`}
            >
              <span className="text-base">⚙️</span>
            </button>
          )}
        </div>

        {/* BLOQUE 1: Rendimiento / Situación Actual y Próximo Nivel */}
        <ItemCardProductionInfo prodInfo={prodInfo} level={level} />

        {/* Cajón Rojo de Requisitos Bloqueantes */}
        {(lockReason || (!meetsRequirements && extra) || (lackOfPop && extra)) && (
          <div className="mt-2 mb-2 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] font-mono leading-relaxed text-rose-300">
            <span className="font-bold text-rose-400 inline-flex items-center gap-1 mr-1.5">
              <span>⚠️</span> Requisito:
            </span>
            <span>{lockReason || extra}</span>
          </div>
        )}

        {/* BLOQUE 2: Censo, Mantenimiento y Salarios (Estandarizado) */}
        <ItemCardWorkforceSection
          id={id}
          level={level}
          isResearch={category === 'science' || prodInfo?.kind === 'research'}
          lackOfPop={lackOfPop}
          extra={extra}
        />

        {/* BLOQUE 3: Coste de Mejora y Tiempo de Ensamblaje */}
        <ItemCardCostSection cost={cost} time={time} canAfford={canAfford} planetResources={planetResources} prodInfo={prodInfo} />
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
        {onOpenCodex && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenCodex && onOpenCodex(id); }}
            className={`px-2.5 py-1.5 ${S.btn} bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 hover:text-white flex items-center justify-center focus-ring-game text-xs font-mono font-bold transition shadow-sm`}
            title="Ver detalles completos en Codex"
            aria-label="Ver detalles completos en Codex"
          >
            <span>📋</span>
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
