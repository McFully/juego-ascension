import React from 'react';
import { motion } from 'framer-motion';

/**
 * CommandHubGrid — Rejilla de tarjetas de un hub de mando.
 *
 * Solo sabe de reordenar, arrastrar y maquetar. No sabe si el hub es el del
 * imperio o el de un mundo: de eso responde quien lo usa, que además decide la
 * clave de almacenamiento del orden.
 *
 * @param {object} cardsMap       definiciones de tarjeta por id
 * @param {string[]} cardOrder    orden actual
 * @param {string} lockedCardId   tarjeta inamovible (normalmente el retorno al imperio)
 * @param {string} columnsClass   clases de rejilla del hub
 */
export const CommandHubGrid = ({
  cardsMap,
  cardOrder,
  lockedCardId = null,
  columnsClass = 'lg:grid-cols-4',
  isReordering,
  activeDragId,
  setIsReordering,
  handleResetOrder,
  handleMoveCard,
  handlePointerDown,
  handlePointerUpOrCancel,
  handleDragOverTarget,
  handleDragEnd,
}) => {
  const movableCount = cardOrder.length - (lockedCardId ? 1 : 0);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${columnsClass} gap-4 items-stretch relative`}>
      {cardOrder.map((id, index) => {
        const cardElement = cardsMap[id];
        if (!cardElement) return null;

        const isLockedCard = id === lockedCardId;
        const isCardDragging = activeDragId === id;
        // El límite hacia la derecha de cualquier tarjeta móvil es justo antes
        // de la tarjeta inamovible.
        const maxMovableIndex = movableCount - 1;

        const clonedCard = React.cloneElement(cardElement, {
          isDragging: isCardDragging,
          isPressing: false,
          isReordering: isReordering && !isLockedCard,
          canMoveLeft: !isLockedCard && index > 0,
          canMoveRight: !isLockedCard && index < maxMovableIndex,
          onMoveLeft: () => handleMoveCard(id, 'left'),
          onMoveRight: () => handleMoveCard(id, 'right'),
          imageCoverProps: (isLockedCard || !isReordering) ? null : {
            onPointerDown: () => handlePointerDown(id),
            onPointerUp: handlePointerUpOrCancel,
            onPointerLeave: handlePointerUpOrCancel,
            title: "Arrastra para reordenar"
          }
        });

        return (
          <motion.div
            key={id}
            layout={isReordering}
            transition={isReordering ? {
              type: "spring",
              damping: 25,
              stiffness: 350
            } : { duration: 0 }}
            drag={!isLockedCard && isReordering}
            dragSnapToOrigin={true}
            onDragStart={() => {
              if (isLockedCard || !isReordering) return;
              if (window.playSfx) window.playSfx('click');
            }}
            onDrag={(e, info) => {
              if (isLockedCard || !isReordering) return;
              const pointX = info?.point?.x ?? e.clientX;
              const pointY = info?.point?.y ?? e.clientY;
              if (typeof pointX === 'number' && typeof pointY === 'number') {
                const elements = document.elementsFromPoint(pointX, pointY);
                for (const el of elements) {
                  const hubCardContainer = el.closest?.('[data-hub-card-id]');
                  if (hubCardContainer) {
                    const targetId = hubCardContainer.getAttribute('data-hub-card-id');
                    if (targetId && targetId !== id && targetId !== lockedCardId) {
                      handleDragOverTarget(id, targetId, lockedCardId);
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
                : (!isLockedCard && isReordering ? 'cursor-grab' : '')
            }`}
            data-hub-card-id={id}
          >
            {clonedCard}
          </motion.div>
        );
      })}
    </div>
  );
};