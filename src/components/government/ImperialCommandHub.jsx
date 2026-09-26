import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HubTopBar } from './hub/HubTopBar.jsx';
import { HubCard } from './hub/HubCard.jsx';
import { buildCommandHubCards } from './hub/commandHubCardsConfig.jsx';

// Orden exclusivo para Mando Imperial central (8 tarjetas imperiales)
const IMPERIAL_COMMAND_CARDS = [
  'missions',
  'shipDesign',
  'combat',
  'colony_network',
  'stats',
  'imperial_council',
  'imperial_senate',
  'diplomacy'
];

// Orden exclusivo para Alto Mando de planeta individual (10 tarjetas locales + Volver a Imperio)
const PLANETARY_COMMAND_CARDS = [
  'ministries',
  'planetary_senate',
  'galaxy',
  'market',
  'defense',
  'missiles',
  'shipyard',
  'fleet',
  'moon',
  'debris',
  'back_to_empire'
];

export const ImperialCommandHub = React.memo(({
  state,
  dispatch,
  currentPlanet,
  production,
  fmt,
  RESEARCH = {},
  onEnterMinistries,
  onNavigateTab,
  onOpenPlanetarySenate,
  onBackToEmpire,
  ministryCount = 19,
  isImperialScreen = false,
  showTopBar = true
}) => {
  const allowedCards = isImperialScreen ? IMPERIAL_COMMAND_CARDS : PLANETARY_COMMAND_CARDS;
  const storageKey = isImperialScreen ? 'ascension_cmd_hub_imperial_v1' : 'ascension_cmd_hub_planet_v1';

  const pMinistries = currentPlanet?.ministries || state?.ministries || {};
  const activeMinistersCount = Object.values(pMinistries).filter(m => m?.minister).length;
  const autoMinistriesCount = Object.values(pMinistries).filter(m => m?.minister && (m.automationEnabled || m.autoManage)).length;

  const missions = state?.missions || [];
  const claimedCount = (state?.claimedMissions || []).length;
  const readyMissions = missions.filter(m => m.progress >= m.target && !(state?.claimedMissions || []).includes(m.id)).length;
  const fleets = state?.fleets || [];

  const researchLabLevel = currentPlanet?.buildings?.researchLab || 0;
  const activeResearchQueue = state?.researchQueue || [];
  const activeResearch = activeResearchQueue[0];
  const researchedCount = Object.values(state?.research || {}).filter(lvl => lvl > 0).length;
  const totalResearchCount = Object.keys(RESEARCH || {}).length;

  const totalDefenses = Object.values(currentPlanet?.defenses || {}).reduce((a, b) => a + b, 0);
  const totalShips = Object.values(currentPlanet?.fleet || {}).reduce((a, b) => a + b, 0);
  const totalMissiles = Object.values(currentPlanet?.missiles || {}).reduce((a, b) => a + b, 0);
  const siloLevel = currentPlanet?.buildings?.missileSilo || 0;
  const shipyardLevel = currentPlanet?.buildings?.shipyard || 0;
  const maxMissiles = siloLevel * 10;
  const hasMoon = !!currentPlanet?.moon;
  const localDebris = (currentPlanet?.debris?.metal || 0) + (currentPlanet?.debris?.crystal || 0);
  const globalDebris = (state?.debrisField?.metal || 0) + (state?.debrisField?.crystal || 0);
  const totalDebrisTons = localDebris > 0 ? localDebris : globalDebris;

  // Estado del orden de las tarjetas según el contexto (Imperial vs Planetario)
  const [cardOrder, setCardOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validSaved = parsed.filter(id => allowedCards.includes(id));
          const missingIds = allowedCards.filter(id => !validSaved.includes(id));
          return [...validSaved, ...missingIds];
        }
      }
    } catch {
      // fallback
    }
    return allowedCards;
  });

  const updateCardOrder = (newOrder) => {
    const valid = newOrder.filter(id => allowedCards.includes(id));
    setCardOrder(valid);
    try {
      localStorage.setItem(storageKey, JSON.stringify(valid));
    } catch {
      // ignorar
    }
  };

  // Restablecer al orden por defecto
  const handleResetOrder = () => {
    updateCardOrder(allowedCards);
    if (window.playSfx) window.playSfx('build');
  };

  // Mover tarjeta mediante botones manuales (flechas)
  const handleMoveCard = (id, direction) => {
    const currentIndex = cardOrder.indexOf(id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= cardOrder.length) return;

    const next = [...cardOrder];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);
    updateCardOrder(next);
    if (window.playSfx) window.playSfx('click');
  };

  // Modo reordenación activa y arrastre
  const [isReordering, setIsReordering] = useState(false);
  const [activeDragId, setActiveDragId] = useState(null);
  const [pressingId, setPressingId] = useState(null);
  const longPressTimerRef = useRef(null);
  const lastSwapTimeRef = useRef(0);

  const startDragNow = (id) => {
    if (window.playSfx) window.playSfx('click');
    setActiveDragId(id);
    setIsReordering(true);
    setPressingId(null);
  };

  const handlePointerDown = (id) => {
    if (!isReordering) return;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    // Si ya estamos en modo reordenar, activar drag inmediatamente al pulsar
    startDragNow(id);
  };

  const handlePointerUpOrCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setPressingId(null);
  };

  // Swap en tiempo real mientras se arrastra la tarjeta sobre otra
  const handleDragOverTarget = (draggedId, targetId) => {
    if (!draggedId || !targetId || draggedId === targetId) return;
    // 'back_to_empire' es inamovible y siempre queda en la última posición
    if (draggedId === 'back_to_empire' || targetId === 'back_to_empire') return;
    const now = Date.now();
    // Throttle para estabilidad de animación
    if (now - lastSwapTimeRef.current < 150) return;

    const oldIdx = cardOrder.indexOf(draggedId);
    const newIdx = cardOrder.indexOf(targetId);
    if (oldIdx !== -1 && newIdx !== -1) {
      lastSwapTimeRef.current = now;
      const next = [...cardOrder];
      const [moved] = next.splice(oldIdx, 1);
      next.splice(newIdx, 0, moved);
      updateCardOrder(next);
      if (window.playSfx) window.playSfx('click');
    }
  };

  const handleDragEnd = () => {
    if (window.playSfx) window.playSfx('build');
    setActiveDragId(null);
    setPressingId(null);
  };

  // Diccionario completo de definiciones de tarjetas delegado en configuración modular
  const cardsMap = useMemo(() => buildCommandHubCards({
    onEnterMinistries,
    onNavigateTab,
    onOpenPlanetarySenate,
    onBackToEmpire,
    ministryCount,
    activeMinistersCount,
    autoMinistriesCount,
    readyMissions,
    claimedCount,
    missions,
    fmt,
    state,
    currentPlanet,
    fleets,
    shipyardLevel,
    siloLevel,
    totalDefenses,
    totalMissiles,
    maxMissiles,
    totalShips,
    hasMoon,
    totalDebrisTons,
    dispatch
  }), [
    onEnterMinistries,
    onNavigateTab,
    onOpenPlanetarySenate,
    onBackToEmpire,
    ministryCount,
    activeMinistersCount,
    autoMinistriesCount,
    readyMissions,
    claimedCount,
    missions,
    fmt,
    state,
    currentPlanet,
    fleets,
    shipyardLevel,
    siloLevel,
    totalDefenses,
    totalMissiles,
    maxMissiles,
    totalShips,
    hasMoon,
    totalDebrisTons,
    dispatch
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {showTopBar && (
        <HubTopBar
          currentPlanet={currentPlanet}
          production={production}
          state={state}
          dispatch={dispatch}
          fmt={fmt}
          onBackToEmpire={onBackToEmpire}
          onNavigateTab={onNavigateTab}
          isReordering={isReordering}
          onToggleReorder={() => setIsReordering(prev => !prev)}
          onResetOrder={handleResetOrder}
          showResources={!isImperialScreen}
        />
      )}

      {/* Grid: 4 columnas para Mando Imperial (8 tarjetas) / 6 columnas para Alto Mando planetario (18 tarjetas) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${isImperialScreen ? 'lg:grid-cols-4' : 'lg:grid-cols-4 xl:grid-cols-6'} gap-4 items-stretch relative`}>
        {cardOrder.map((id, index) => {
          const cardElement = cardsMap[id];
          if (!cardElement) return null;

          const isBackCard = id === 'back_to_empire';
          const isCardDragging = activeDragId === id;
          const isCardPressing = pressingId === id;
          // El límite hacia la derecha para cualquier tarjeta móvil es justo antes de 'back_to_empire'
          const maxMovableIndex = cardOrder.length - 2;

          // Inyectamos props a HubCard para la interacción de pulsación prolongada y botones
          const clonedCard = React.cloneElement(cardElement, {
            isDragging: isCardDragging,
            isPressing: isCardPressing,
            isReordering: isReordering && !isBackCard,
            canMoveLeft: !isBackCard && index > 0,
            canMoveRight: !isBackCard && index < maxMovableIndex,
            onMoveLeft: () => handleMoveCard(id, 'left'),
            onMoveRight: () => handleMoveCard(id, 'right'),
            imageCoverProps: (isBackCard || !isReordering) ? null : {
              onPointerDown: () => handlePointerDown(id),
              onPointerUp: handlePointerUpOrCancel,
              onPointerLeave: handlePointerUpOrCancel,
              title: "Arrastra para reordenar"
            }
          });

          return (
            <motion.div
              key={id}
              layout
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 350
              }}
              drag={!isBackCard && isReordering}
              dragSnapToOrigin={true}
              onDragStart={() => {
                if (isBackCard || !isReordering) return;
                if (window.playSfx) window.playSfx('click');
                setActiveDragId(id);
              }}
              onDrag={(e, info) => {
                if (isBackCard || !isReordering) return;
                const pointX = info?.point?.x ?? e.clientX;
                const pointY = info?.point?.y ?? e.clientY;
                if (typeof pointX === 'number' && typeof pointY === 'number') {
                  const elements = document.elementsFromPoint(pointX, pointY);
                  for (const el of elements) {
                    const hubCardContainer = el.closest?.('[data-hub-card-id]');
                    if (hubCardContainer) {
                      const targetId = hubCardContainer.getAttribute('data-hub-card-id');
                      if (targetId && targetId !== id && targetId !== 'back_to_empire') {
                        handleDragOverTarget(id, targetId);
                        break;
                      }
                    }
                  }
                }
              }}
              onDragEnd={handleDragEnd}
              className={`relative h-full select-none ${
                isCardDragging
                  ? 'z-50 cursor-grabbing filter drop-shadow-[0_0_30px_rgba(6,182,212,0.8)] scale-105'
                  : (!isBackCard && isReordering ? 'cursor-grab' : '')
              }`}
              data-hub-card-id={id}
            >
              {clonedCard}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});
